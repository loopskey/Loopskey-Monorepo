import {
  COACH_EDIT_GREETING_CODE,
  COACH_INTRO_CODE,
  COACH_QUESTION_CODE,
  isCoachMessage,
} from "./roadmap-coach.util";

describe("isCoachMessage", () => {
  it.each([COACH_INTRO_CODE, COACH_QUESTION_CODE, COACH_EDIT_GREETING_CODE])(
    "recognises the code %s",
    (code) => {
      expect(isCoachMessage(code)).toBe(true);
    },
  );

  it.each(["What do you want to learn?", "", "ROADMAP_COACH_OTHER"])(
    "does not mistake %j for a code",
    (text) => {
      expect(isCoachMessage(text)).toBe(false);
    },
  );
});
