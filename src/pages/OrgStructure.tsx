import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronLeft, Building2, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrgNode {
  id: string;
  title: string;
  name: string;
  children?: OrgNode[];
}

const orgData: OrgNode = {
  id: "root",
  title: "وكيل الأمين للصيانة والتشغيل وتحسين المشهد الحضري",
  name: "م/ ماجد بن محمد آل غنيم",
  children: [
    {
      id: "dep1",
      title: "الوكيل المساعد للصيانة والتشغيل",
      name: "م/ طلال بن مبارك الزهراني",
      children: [
        { id: "d1", title: "إدارة صيانة الكهرباء والإنارة", name: "م.ف/ عبد الله سالم" },
        { id: "d2", title: "إدارة صيانة المرافق", name: "أ/ عبد الله جمعان" },
        { id: "d3", title: "إدارة الدعم والبلاغات", name: "" },
        {
          id: "d4",
          title: "الإدارة العامة لصيانة الطرق والسيول",
          name: "م/ شباب محمد سعد الغامدي",
          children: [
            { id: "d4a", title: "إدارة مختبر الأمانة", name: "م.ف/ فهد عبير" },
            { id: "d4b", title: "إدارة صيانة طرق الباحة", name: "م/ عمر عبيد الحميري" },
            { id: "d4c", title: "إدارة التسمية والترقيم", name: "م/ سلطان محمد الغامدي" },
            { id: "d4d", title: "إدارة صيانة السيول", name: "م/ فواز قرهم الزهراني" },
            { id: "d4e", title: "إدارة صيانة الطرق المنقولة من وزارة النقل", name: "م/ سلطان محمد الغامدي" },
          ],
        },
        {
          id: "d5",
          title: "مشرف عقود الصيانة",
          name: "م.ف/ علي محمد المرزوقي",
          children: [
            { id: "d5a", title: "مشرف عمال الجهود الذاتية", name: "أ/ صالح العمري" },
            { id: "d5b", title: "مشرف مخزون إدارة الصيانة", name: "أ/ خالد أبو غنيمة" },
          ],
        },
      ],
    },
    {
      id: "dep2",
      title: "الوكيل المساعد لتحسين المشهد الحضري",
      name: "م/ خالد بن عثمان الزندي",
      children: [
        {
          id: "d6",
          title: "المشرف العام على تحسين المشهد الحضري",
          name: "م/ محمد الشهري",
          children: [
            { id: "d6a", title: "إدارة التحسين والجودة", name: "م/ فواز قرهم الزهراني" },
            { id: "d6b", title: "غرفة عمليات التشوه البصري", name: "م/ خالد خضر" },
          ],
        },
      ],
    },
  ],
};

const OrgNodeComponent = ({ node, level = 0 }: { node: OrgNode; level?: number }) => {
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = node.children && node.children.length > 0;

  const bgColors = [
    "bg-gradient-to-l from-[hsl(200,50%,18%)] to-[hsl(195,65%,25%)]",
    "bg-gradient-to-l from-[hsl(195,60%,30%)] to-[hsl(195,55%,35%)]",
    "bg-card border border-border",
  ];
  const textColors = [
    "text-primary-foreground",
    "text-primary-foreground",
    "text-foreground",
  ];

  const bg = bgColors[Math.min(level, 2)];
  const text = textColors[Math.min(level, 2)];

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => hasChildren && setExpanded(!expanded)}
        className={cn(
          "rounded-xl px-6 py-4 shadow-md transition-all duration-300 min-w-[250px] max-w-[400px]",
          bg,
          text,
          hasChildren && "cursor-pointer hover:shadow-lg hover:scale-[1.02]",
          !hasChildren && "cursor-default"
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="text-right flex-1">
            <p className="font-bold text-sm leading-relaxed">{node.title}</p>
            {node.name && (
              <p className={cn("text-xs mt-1", level < 2 ? "opacity-80" : "text-muted-foreground")}>
                {node.name}
              </p>
            )}
          </div>
          {hasChildren && (
            <div className={cn("transition-transform duration-200", expanded && "rotate-180")}>
              <ChevronDown className="w-4 h-4" />
            </div>
          )}
        </div>
      </button>

      {hasChildren && expanded && (
        <div className="mt-4 relative">
          {/* Vertical connector */}
          <div className="absolute top-0 left-1/2 w-px h-4 bg-border -translate-x-1/2" />
          
          <div className="pt-4 flex flex-wrap gap-4 justify-center">
            {node.children!.map((child) => (
              <OrgNodeComponent key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const OrgStructure = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-l from-[hsl(var(--header-gradient-from))] to-[hsl(var(--header-gradient-to))] text-primary-foreground px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            الرئيسية
          </Button>
          <h1 className="text-xl font-bold flex items-center gap-3">
            <Users className="w-6 h-6" />
            هيكل الوكالة
          </h1>
          <Button
            onClick={() => navigate("/departments")}
            className="bg-primary-foreground/15 hover:bg-primary-foreground/25 border border-primary-foreground/30"
          >
            الإدارات
            <ChevronLeft className="w-4 h-4 mr-2" />
          </Button>
        </div>
      </div>

      {/* Org Chart */}
      <div className="max-w-7xl mx-auto px-6 py-8 overflow-x-auto">
        <div className="min-w-[600px] flex justify-center">
          <OrgNodeComponent node={orgData} />
        </div>
      </div>
    </div>
  );
};

export default OrgStructure;
