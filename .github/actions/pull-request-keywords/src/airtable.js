import Airtable from "airtable";

const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_ID);

const automatedReviewTable = base('Automated Review Association');

const lookupTextFormula = (labels, issues) => {
    const labelConditionals = labels.map( (label) => `FIND(${label}, ARRAYJOIN(Labels))`);
    const issueConditionals = issues.map((issue) => `FIND(${issue}, ARRAYJOIN(Issues))`)

    const conditionals = `${labelConditionals.join(', ')}, ${issueConditionals.join(', ')}`
    const finalFormula = `IF(OR(${conditionals}),1,0)`;

    return finalFormula;
}


const fetchReviewNames = async (labels, issues) => {
    const formula = lookupTextFormula(labels, issues);

    const reviewNames = [];
    automatedReviewTable.select(
        {
            fields: ["Name"],
            filterByFormula: formula,
        }
    ).eachPage( (records, fetchNextPage) =>  {
        records.forEach((record) => {
            reviewNames.push(record.get("Name"));
        });
    
        fetchNextPage();
    }, (err) => {
        throw err;
    });
}

export {fetchReviewNames};