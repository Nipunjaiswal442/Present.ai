from typing import Optional
import re

from llmai import get_client
from llmai.shared import JSONSchemaResponse, Message, SystemMessage, UserMessage
from models.presentation_layout import PresentationLayoutModel
from models.presentation_outline_model import PresentationOutlineModel
from utils.llm_config import get_llm_config
from utils.llm_client_error_handler import handle_llm_client_exceptions
from utils.llm_utils import DisconnectChecker, generate_structured_with_schema_retries
from utils.llm_provider import get_model
from utils.get_dynamic_models import get_presentation_structure_model_with_n_slides
from utils.schema_utils import prepare_schema_for_validation
from models.presentation_structure_model import PresentationStructureModel


STRUCTURE_FROM_SLIDES_MARKDOWN_SYSTEM_PROMPT = """
You will be given available slide layouts and content for each slide.
You need to select a layout for each slide based on the mentioned guidelines.

# Steps
1. Analyze all available slide layouts.
2. Analyze content for each slide.
3. Select a layout for each slide one by one by following the selection rules.

# Analyzing Slide Layouts
- Identify what each layout contains based on provided schema markdown.

# Analyzing Content
- Identify how the content is structured.
- Identify if the content contains tables.

# Selection Rules
- If content contains table, then select either table layout or graph layout.
- Don't select layout with image unless content contains image or the user explicitly requests imagery.
- Don't select table layout if content does not contain table.
- You are allowed to select same layout for multiple slides.

# Table Layout Selection Rules
- Must select table layout if the content contains table with text data.
- Must only select a layout with table if the table only contains text data.

# Graph Layout Selection Rules
- Must only select a layout with chart if the content contains table with numeric data.
- Identify how many columns are present in the table.
- Must select a layout that supports n-1 charts for n columns.
- Must prioritize layouts that support multiple charts.
- Don't select metrics layout for content containing table with numeric data.
- For example, if content contains table with 3 columns, then select a layout that supports 2 charts.

{user_intent}

# User Intent Rules
- Extract visual constraints from User Instructions and Original User Request; User Instructions win conflicts.
- The supplied slide count is authoritative. Slide numbers are one-based; "all" means every slide.
- Prefer exact chart types and image placements, reusing layouts if needed.
- Treat a numeric table on a chart-requested slide as chart data, not a request for a table-only layout.

# Output Rules: 
- One layout index for each slide.
- Example: [0, 1, 2, 3, 4]

{presentation_layout}
"""


GET_MESSAGES_SYSTEM_PROMPT = """
You're a professional presentation designer with creative freedom to design engaging presentations.

# DESIGN PHILOSOPHY
- Create visually compelling and varied presentations
- Match layout to content purpose and audience needs

# Layout Selection Guidelines
1. **Content-driven choices**: Let the slide's purpose guide layout selection
- Opening/closing → Title layouts
- Processes/workflows → Visual process layouts  
- Comparisons/contrasts → Side-by-side layouts
- Data/metrics → Chart/graph layouts
- Only choose charts when the slide supplies actual numerical observations.
- Never invent numbers to fill a chart. Qualitative ideas and action lists need
  text, cards, or process layouts, even when a chart would add visual variety.
- Concepts/ideas → Image + text layouts
- Key insights → Emphasis layouts

2. **Visual variety**: Aim for diverse slide layouts across the presentation. 
- Don't use same layout for multiple slides unless necessary.
- Mix text-heavy and visual-heavy slides naturally
- Use your judgment on when repetition serves the content
- Balance information density across slides
- Adjacent slide layouts should be different unless instructed/necessary otherwise.

3. **Audience experience**: Consider how slides work together
- Create natural transitions between topics

4. **Table of contents**:
- Must only use table of contents layout if slide content contains table of contents.

{user_instruction_header}

Extract visual constraints from User Instructions and Original User Request; User
Instructions win conflicts. The supplied slide count is authoritative. Slide numbers are
one-based, and "all" or "every" includes the title slide. Prefer exact chart types and
image placements over variety, reusing layouts if needed. A numeric table on a
chart-requested slide is chart data, not a request for a table-only layout.

Select layout index for each of the {n_slides} slides based on what will best serve the presentation's goals.

"""


def get_messages(
    presentation_layout: PresentationLayoutModel,
    n_slides: int,
    data: str,
    instructions: Optional[str] = None,
    source_content: Optional[str] = None,
) -> list[Message]:
    intent_sections = []
    if instructions:
        intent_sections.append(f"# User Instructions:\n{instructions}")
    if source_content:
        intent_sections.append(f"# Original User Request:\n{source_content}")
    system_prompt = GET_MESSAGES_SYSTEM_PROMPT.format(
        user_instruction_header="\n\n".join(intent_sections),
        n_slides=n_slides,
    )

    return [
        SystemMessage(content=system_prompt),
        UserMessage(
            content=(
                f"{presentation_layout.to_string()}\n\n"
                "--------------------------------------\n\n"
                f"{data}"
            )
        ),
    ]


def get_messages_for_slides_markdown(
    presentation_layout: PresentationLayoutModel,
    n_slides: int,
    data: str,
    instructions: Optional[str] = None,
    source_content: Optional[str] = None,
) -> list[Message]:
    intent_sections = []
    if instructions:
        intent_sections.append(f"# User Instructions:\n{instructions}")
    if source_content:
        intent_sections.append(f"# Original User Request:\n{source_content}")
    system_prompt = STRUCTURE_FROM_SLIDES_MARKDOWN_SYSTEM_PROMPT.format(
        user_intent="\n\n".join(intent_sections),
        presentation_layout=presentation_layout.to_string(with_schema=True),
    )

    return [SystemMessage(content=system_prompt), UserMessage(content=data)]


async def generate_presentation_structure(
    presentation_outline: PresentationOutlineModel,
    presentation_layout: PresentationLayoutModel,
    instructions: Optional[str] = None,
    using_slides_markdown: bool = False,
    source_content: Optional[str] = None,
    disconnect_checker: Optional[DisconnectChecker] = None,
) -> PresentationStructureModel:
    client = get_client(config=get_llm_config())
    model = get_model()
    response_model = get_presentation_structure_model_with_n_slides(
        len(presentation_outline.slides)
    )

    try:
        messages = (
            get_messages_for_slides_markdown(
                presentation_layout,
                len(presentation_outline.slides),
                presentation_outline.to_string(),
                instructions,
                source_content,
            )
            if using_slides_markdown
            else get_messages(
                presentation_layout,
                len(presentation_outline.slides),
                presentation_outline.to_string(),
                instructions,
                source_content,
            )
        )
        structure_schema = prepare_schema_for_validation(
            response_model.model_json_schema(),
            strict=False,
        )
        response_format = JSONSchemaResponse(
            name="response",
            json_schema=structure_schema,
            strict=False,
        )

        content = await generate_structured_with_schema_retries(
            client,
            model,
            messages=messages,
            response_format=response_format,
            json_schema=structure_schema,
            strict=False,
            validate_schema=True,
            disconnect_checker=disconnect_checker,
        )
        structure = PresentationStructureModel(**content)
        return avoid_unsupported_chart_layouts(structure, presentation_outline, presentation_layout)
    except Exception as e:
        raise handle_llm_client_exceptions(e)


def avoid_unsupported_chart_layouts(
    structure: PresentationStructureModel,
    outline: PresentationOutlineModel,
    layout: PresentationLayoutModel,
) -> PresentationStructureModel:
    """A chart schema must not force a model to invent data for qualitative slides."""
    def has_chart_schema(value) -> bool:
        if isinstance(value, dict):
            properties = value.get("properties", {})
            if isinstance(properties, dict) and "chart_type" in properties:
                return True
            return any(has_chart_schema(child) for child in value.values())
        return isinstance(value, list) and any(has_chart_schema(child) for child in value)

    chart_indexes = {i for i, slide in enumerate(layout.slides) if has_chart_schema(slide.json_schema)}
    alternatives = [i for i in range(len(layout.slides)) if i not in chart_indexes]
    if not alternatives:
        return structure
    repaired = list(structure.slides)
    for index, choice in enumerate(repaired):
        if choice not in chart_indexes or index >= len(outline.slides):
            continue
        # Ordered-list markers and slide numbers are not chart observations.
        text = re.sub(r"(?mi)^\s*(?:#{1,6}\s*)?slide\s+\d+\b[.):]?\s*", "", outline.slides[index].content)
        text = re.sub(r"(?m)^\s*\d+[.)]\s+", "", text)
        if not re.search(r"\d", text):
            repaired[index] = alternatives[index % len(alternatives)]
    return PresentationStructureModel(slides=repaired)
