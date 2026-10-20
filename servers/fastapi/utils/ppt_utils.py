from models.presentation_layout import PresentationLayoutModel
from models.presentation_outline_model import PresentationOutlineModel
import re
from typing import List

from models.presentation_structure_model import PresentationStructureModel
from utils.outline_utils import get_presentation_title_from_presentation_outline


def get_presentation_title_from_outlines(
    presentation_outlines: PresentationOutlineModel,
) -> str:
    return get_presentation_title_from_presentation_outline(presentation_outlines)


def find_slide_layout_index_by_regex(
    layout: PresentationLayoutModel, patterns: List[str]
) -> int:
    def _find_index(pattern: str) -> int:
        regex = re.compile(pattern, re.IGNORECASE)
        for index, slide_layout in enumerate(layout.slides):
            candidates = [
                slide_layout.id or "",
                (slide_layout.name or ""),
                (slide_layout.description or ""),
                (slide_layout.json_schema.get("title") if slide_layout.json_schema else ""),
            ]
            for text in candidates:
                if text and regex.search(text):
                    return index
        return -1

    for pattern in patterns:
        match_index = _find_index(pattern)
        if match_index != -1:
            return match_index

    return -1


def select_toc_or_list_slide_layout_index(
    layout: PresentationLayoutModel,
) -> int:
    toc_patterns = [
        r"\btable\s*of\s*contents\b",
        r"\btable[- ]?of[- ]?contents\b",
        r"\bagenda\b",
        r"\bcontents\b",
        r"\boutline\b",
        r"\bindex\b",
        r"\btoc\b",
    ]

    list_patterns = [
        r"\b(bullet(ed)?\s*list|bullets?)\b",
        r"\b(numbered\s*list|ordered\s*list|unordered\s*list)\b",
        r"\blist\b",
    ]

    toc_index = find_slide_layout_index_by_regex(layout, toc_patterns)
    if toc_index != -1:
        return toc_index

    return find_slide_layout_index_by_regex(layout, list_patterns)
