import requests
from bs4 import BeautifulSoup
import re

def scrape_pr(org, repo, number):
    r = requests.get(f"https://github.com/{org}/{repo}/pull/{number}")
    soup = BeautifulSoup(r.text, 'html.parser')
    issueForm = soup.find("form", { "aria-label": re.compile('Link issues')})

    print([ i["href"] for i in issueForm.find_all("a")])

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--organization", "-o", default="hatchways", help="The name of the organization that owns the repository.")
    parser.add_argument(
        "--repo", "-r", help="The name of the repo pr belongs to.")
    parser.add_argument(
        "--number", "-n", help="The number of the pull request.")

    args = parser.parse_args()

    org = args.organization
    repo = args.repo
    pr_number = args.number
    
    if org is None:
        print("Please specify a valid organization or use the default ('hatchways')")

    if repo is None:
        print("Please specify a repository.")

    if pr_number is None:
        print("Please specify the number of the pr you want to scrape.")
    
    if pr_number and repo:
        scrape_pr(org, repo, pr_number)
 