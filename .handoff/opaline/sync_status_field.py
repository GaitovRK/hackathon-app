"""Copies an issue's `status:*` label into the Status field of every project the issue is in, so the board columns
follow what the agents do (cloud agents can only set labels). Options are matched by name, ignoring case and spaces:
status:todo -> Todo / Ready, status:in-progress -> In Progress, status:review -> In Review / Review, status:blocked -> Blocked.
A label with no matching option is skipped.

  PROJECT_TOKEN=<classic PAT: repo, project> REPO=GaitovRK/outfit-studio ISSUE=94 LABEL=status:review \
    python3 scripts/agents/sync_status_field.py [--dry-run]
"""
import json, os, re, sys, urllib.request

FIELD = os.environ.get('STATUS_FIELD', 'Status')
REPO = os.environ.get('REPO', 'GaitovRK/outfit-studio')
DRY = '--dry-run' in sys.argv
# label suffix -> option names it may match (normalized: lowercase, letters and digits only)
WANTED = {
    'todo': ['todo', 'ready'],
    'in-progress': ['inprogress', 'doing'],
    'review': ['inreview', 'review'],
    'blocked': ['blocked'],
}

ITEMS = """query($owner: String!, $repo: String!, $number: Int!) {
  repository(owner: $owner, name: $repo) { issue(number: $number) { projectItems(first: 20) { nodes {
    id
    project { id title field(name: "%s") { ... on ProjectV2SingleSelectField { id options { id name } } } }
    fieldValueByName(name: "%s") { ... on ProjectV2ItemFieldSingleSelectValue { name } }
  } } } }
}""" % (FIELD, FIELD)

SET = """mutation($project: ID!, $item: ID!, $field: ID!, $option: String!) {
  updateProjectV2ItemFieldValue(input: {projectId: $project, itemId: $item, fieldId: $field,
                                        value: {singleSelectOptionId: $option}}) { projectV2Item { id } }
}"""


def graphql(query, **variables):
    req = urllib.request.Request('https://api.github.com/graphql', method='POST',
                                 data=json.dumps({'query': query, 'variables': variables}).encode(),
                                 headers={'Authorization': f"Bearer {os.environ['PROJECT_TOKEN']}"})
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read())
    if data.get('errors'):
        sys.exit(f"GraphQL error: {data['errors']}")
    return data['data']


def norm(name):
    return re.sub(r'[^a-z0-9]', '', name.lower())


def main():
    label, number = os.environ['LABEL'], int(os.environ['ISSUE'])
    keys = WANTED.get(label.removeprefix('status:'))
    if not keys:
        return print(f'{label}: no Status mapping, skipped')
    owner, repo = REPO.split('/')
    items = graphql(ITEMS, owner=owner, repo=repo, number=number)['repository']['issue']['projectItems']['nodes']
    if not items:
        return print(f'#{number} is in no project, skipped')
    for item in items:
        project, field = item['project'], item['project'].get('field') or {}
        option = next((o for k in keys for o in field.get('options', []) if norm(o['name']) == k), None)
        if not option:
            print(f"'{project['title']}': no {FIELD} option for {label} in {[o['name'] for o in field.get('options', [])]}")
            continue
        current = (item.get('fieldValueByName') or {}).get('name')
        if current == option['name']:
            print(f"'{project['title']}': #{number} already {current}")
            continue
        print(f"'{project['title']}': #{number} {current or '-'} -> {option['name']}")
        if not DRY:
            graphql(SET, project=project['id'], item=item['id'], field=field['id'], option=option['id'])


if __name__ == '__main__':
    main()
