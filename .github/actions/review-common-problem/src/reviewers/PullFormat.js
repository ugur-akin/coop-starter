const githubNumberNotationRe = /#\d+/;
const stackLabelRe = /(\s\d_-|^)(fs|fe|be|in)(\s\d_-|$)/i;

const isLetter = (c) => {
  return c.toLowerCase() !== c.toUpperCase();
};

const replaceDashes = (str) => {
  const result = str.replace("-", " ");
  return result;
};

const firstLetterCapitalized = (str) => {
  const first = str.at(0);
  const result = isLetter(first) && first === first.toUpperCase();
  return result;
};

const toLowerCaseAlphabeticOnly = (str) => {
  const alphabetic = str.replace(/[^a-zA-Z]/, "");
  const result = alphabetic.toLowerCase();
  return result;
};

// ----------------------------------------- //
const titlePassesChecks = (pull) => {
  const { title, head } = pull;
  const { label, ref } = head;

  const captialized = firstLetterCapitalized(title);
  const branchNameUntouched =
    toLowerCaseAlphabeticOnly(title) === toLowerCaseAlphabeticOnly(ref);
  const includesIssueLink = str.search(githubNumberNotationRe) !== -1;
  const includesStackLabel = str.search(stackLabelRe) !== -1;

  //TODO: Use bitshift to return a code?
  const failed =
    captialized ||
    branchNameUntouched ||
    includesIssueLink ||
    includesStackLabel;

  return !failed;
};

const bodyPassesChecks = (pull) => {
  const { body, head } = pull;
  const { label, ref } = head;

  /**
   * TODO:
   *  - Split by title lines against template, section fully edited or removed.
   *  - If issue is frontend, check for screenshots.
   *  - Check for automatic issue link
   */

  // const uneditedTemplate;
};
