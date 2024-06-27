import { useTranslation } from 'react-i18next';
import { IssueRequestStatus } from './issue-request-status.enum';
import { FixType } from './fix-type.enum';

export const useIssueRequestStatusTranslation = () => {
  const { t } = useTranslation();

  const getStatusTranslation = (status: IssueRequestStatus) => {
    switch (status) {
      case IssueRequestStatus.PENDING:
        return t('status.pending');
      case IssueRequestStatus.APPROVED:
        return t('status.approved');
      case IssueRequestStatus.REJECTED:
        return t('status.rejected');
      default:
        return status;
    }
  };

  const getFixTypeTranslation = (type: FixType) => {
    switch (type) {
        case FixType.REPLACE:
            return t('fixType.replace')
        case FixType.REPAIR:
            return t('fixType.repair')
        default: 
        return type
    }
  }

  return { getStatusTranslation, getFixTypeTranslation };
};
