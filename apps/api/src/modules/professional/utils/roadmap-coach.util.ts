export const COACH_INTRO_CODE = "ROADMAP_COACH_INTRO";
export const COACH_QUESTION_CODE = "ROADMAP_COACH_QUESTION";

export const isCoachMessage = (content: string) =>
  content === COACH_INTRO_CODE || content === COACH_QUESTION_CODE;
