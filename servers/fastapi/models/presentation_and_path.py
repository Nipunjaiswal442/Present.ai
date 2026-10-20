from pydantic import BaseModel
import uuid


class PresentationAndPath(BaseModel):
    presentation_id: uuid.UUID
    path: str
    download_url: str | None = None


class PresentationPathAndEditPath(PresentationAndPath):
    edit_path: str
