export const ROOM_LIMITS = {
  nameMin: 3,
  nameMax: 80,
  subjectMax: 60,
  descriptionMax: 300,
  membersMax: 50,
} as const;

export interface RoomFormValues {
  name: string;
  subject: string;
  description: string;
  memberIds: string[];
}

export interface RoomFormErrors {
  name?: string;
  subject?: string;
  description?: string;
  members?: string;
}

/** Same rules as the web form. */
export function validateRoomForm(values: RoomFormValues): RoomFormErrors {
  const errors: RoomFormErrors = {};
  const name = values.name.trim();

  if (name.length < ROOM_LIMITS.nameMin) {
    errors.name = `Room name must be at least ${ROOM_LIMITS.nameMin} characters`;
  } else if (name.length > ROOM_LIMITS.nameMax) {
    errors.name = `Room name cannot exceed ${ROOM_LIMITS.nameMax} characters`;
  }

  if (values.subject.trim().length > ROOM_LIMITS.subjectMax) {
    errors.subject = `Subject cannot exceed ${ROOM_LIMITS.subjectMax} characters`;
  }

  if (values.description.trim().length > ROOM_LIMITS.descriptionMax) {
    errors.description = `Description cannot exceed ${ROOM_LIMITS.descriptionMax} characters`;
  }

  if (values.memberIds.length > ROOM_LIMITS.membersMax) {
    errors.members = `A room can have at most ${ROOM_LIMITS.membersMax} invited members`;
  }

  return errors;
}
