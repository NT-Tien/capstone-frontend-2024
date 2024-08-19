import { FixRequestDto } from "../dto/FixRequest.dto";
import { IssueStatusEnum } from "../enum/issue-status.enum";

export function RequestPercentCalculator(request: FixRequestDto) {
    let percent = 0;

    let finishedIssuesCount = 0;
    request.issues.forEach((issue) => {
        if(issue.status === IssueStatusEnum.RESOLVED) {
            finishedIssuesCount++;
        }
    })
    const totalIssues = request.issues.length;

    percent = Math.round((finishedIssuesCount / totalIssues) * 100);

    return percent
}