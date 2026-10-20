from models.presentation_layout import PresentationLayoutModel, SlideLayoutModel
from utils.llm_calls.generate_presentation_structure import (
    avoid_unsupported_chart_layouts,
    get_messages,
    get_messages_for_slides_markdown,
)
from models.presentation_outline_model import PresentationOutlineModel, SlideOutlineModel
from models.presentation_structure_model import PresentationStructureModel


def _layout() -> PresentationLayoutModel:
    return PresentationLayoutModel(
        name="test",
        slides=[
            SlideLayoutModel(
                id="left-image",
                description="Image on the left with text on the right",
                json_schema={"type": "object", "properties": {}},
            ),
            SlideLayoutModel(
                id="bar-chart",
                description="Vertical bar chart",
                json_schema={"type": "object", "properties": {}},
            ),
        ],
    )


def test_structure_prompt_preserves_visual_intent_from_original_request():
    request = (
        "Presentation Topic: Global Warming and AI. I need a bar chart on the "
        "4th slide and images on the left on all slides."
    )

    messages = get_messages(
        _layout(),
        6,
        "outline",
        source_content=request,
    )
    prompt = str(messages[0].content)

    assert f"# Original User Request:\n{request}" in prompt
    assert "Slide numbers are\none-based" in prompt
    assert "Prefer exact chart types and\nimage placements" in prompt
    assert '"all" or "every" includes the title slide' in prompt


def test_slides_markdown_structure_prompt_includes_both_intent_sources():
    messages = get_messages_for_slides_markdown(
        _layout(),
        1,
        "## Climate",
        instructions="Use a bar chart",
        source_content="Climate presentation with visuals on the left",
    )
    prompt = str(messages[0].content)

    assert "# User Instructions:\nUse a bar chart" in prompt
    assert "# Original User Request:\nClimate presentation" in prompt


def test_qualitative_outline_does_not_force_invented_chart_values():
    layout = _layout()
    layout.slides[1].json_schema = {"properties": {"chart": {"properties": {"chart_type": {"type": "string"}}}}}
    outline = PresentationOutlineModel(slides=[
        SlideOutlineModel(content="# Greener neighborhoods\n1. Plant trees\n2. Compost food\n3. Walk more"),
        SlideOutlineModel(content="# Survey results\nRecycling: 45%, Composting: 25%"),
    ])
    result = avoid_unsupported_chart_layouts(PresentationStructureModel(slides=[1, 1]), outline, layout)
    assert result.slides == [0, 1]
