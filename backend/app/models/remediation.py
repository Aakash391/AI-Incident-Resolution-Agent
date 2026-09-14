from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.db.base import Base


class Remediation(Base):
    __tablename__ = "remediations"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(255), nullable=False)

    description = Column(Text, nullable=False)

    playbook = Column(Text, nullable=False)

    playbook_filename = Column(String, nullable=True)

    target_group = Column(String(255), nullable=False)

    risk_level = Column(String(50), nullable=False)

    approved = Column(Boolean, default=False, nullable=False)

    enabled = Column(Boolean, default=True, nullable=False)
    
    remediation_action = Column(
        String(255),
        nullable=False,
        index=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )