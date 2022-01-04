// TODO: Implement a class/inheritance based design here?

const wsReplaced = /-_/;

const branchToTitle = (str) => {
  const removeLines = str.replace(wsReplaced, " ");
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1);

  return capitalized;
};

const SuboptimalTitleReviewer = (pull) => {
  const {
    title,
    base: { label: baseBranch },
    head: { label: headBranch },
  } = pull;

  const defaultTitle = branchToTitle(headBranch);
  const passed = defaultTitle !== title;

  return passed;
};

export { SuboptimalTitleReviewer };
