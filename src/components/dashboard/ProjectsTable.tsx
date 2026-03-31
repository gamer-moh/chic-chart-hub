import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Project } from "@/hooks/useProjects";

interface ProjectsTableProps {
  projects: Project[];
}

const ProjectsTable = ({ projects }: ProjectsTableProps) => {
  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <h3 className="text-base font-bold text-foreground mb-4">تفاصيل المشاريع</h3>
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-right text-muted-foreground text-xs">اسم المشروع</TableHead>
            <TableHead className="text-right text-muted-foreground text-xs">قيمة العقد (ر.س)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id} className="border-border hover:bg-muted/50 transition-colors">
              <TableCell className="text-sm font-medium text-foreground">{project.name}</TableCell>
              <TableCell className="text-sm font-semibold text-foreground tabular-nums">
                {Number(project.contract_value).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectsTable;
