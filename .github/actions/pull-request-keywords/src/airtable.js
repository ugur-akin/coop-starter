import Airtable from "airtable";
import * as core from "@actions/core";

const AIRTABLE_API_KEY = core.getInput("AIRTABLE_API_KEY");
const AIRTABLE_BASE_ID = core.getInput("AIRTABLE_BASE_ID");

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

const automatedReviewTable = base("Automated Review Association");

const lookupTextFormula = (labels, issues) => {
  const labelConditionals = labels.map(
    (label) => `FIND(${label}, ARRAYJOIN(Labels))`
  );
  const issueConditionals = issues.map(
    (issue) => `FIND(${issue}, ARRAYJOIN(Issues))`
  );

  const conditionals = labelConditionals.concat(issueConditionals).join(", ");

  if (!conditionals) {
    return "1";
  }

  const finalFormula = `IF(OR(${conditionals}),1,0)`;
  return finalFormula;
};

const fetchReviewNames = (labels, issues) => {
  const formula = lookupTextFormula(labels, issues);

  const fetchResult = new Promise((resolve, reject) => {
    const reviewNames = [];

    automatedReviewTable
      .select({
        fields: ["Name"],
        filterByFormula: formula,
      })
      .eachPage(
        (page = (records, fetchNextPage) => {
          records.forEach((record) => {
            core.debug(record.get("Name"));
            reviewNames.push(record.get("Name"));
          });

          fetchNextPage();
        }),
        (done = (err) => {
          if (err) {
            reject(err);
          }
          resolve(reviewNames);
        })
      );
  });

  return fetchResult;
};

export { fetchReviewNames };
