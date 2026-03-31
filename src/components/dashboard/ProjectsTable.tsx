import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const projects = [
  {
    name: "نظافة مباني الأمانة - أمانة منطقة الباحة",
    value: "14,691,386.16",
  },
  {
    name: "مشروع صيانة مقابر الأمانة",
    value: "1,587,741.75",
  },
  {
    name: "عقد أداء صيانة المباني والمرافق والمنشآت التابعة لأمانة منطقة الباحة",
    value: "12,550,065.00",
  },
];

const ProjectsTable = () => {
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
          {projects.map((project, idx) => (
            <TableRow key={idx} className="border-border hover:bg-muted/50 transition-colors">
              <TableCell className="text-sm font-medium text-foreground">{project.name}</TableCell>
              <TableCell className="text-sm font-semibold text-foreground tabular-nums">
                {project.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectsTable;
