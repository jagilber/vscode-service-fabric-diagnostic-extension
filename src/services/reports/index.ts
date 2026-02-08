/**
 * Barrel export for report generators and utilities.
 */

export { generateEventsReport } from './EventsReportGenerator';
export { generateHealthReport } from './HealthReportGenerator';
export { generateMetricsReport } from './MetricsReportGenerator';
export { generateCommandsReference } from './CommandsReferenceGenerator';
export { generateEssentialsReport } from './EssentialsReportGenerator';
export { generateRepairTasksReport } from './RepairTasksReportGenerator';
export { exportSnapshot } from './SnapshotExporter';

export {
    resolveClusterEndpoint,
    healthEmoji,
    inferEventHealthState,
    healthCounts,
    groupBy,
    sortedEntries,
    formatEventDetail,
    formatMetricTable,
    writeAndOpenReport,
    serializeTreeItem,
} from './ReportUtils';
