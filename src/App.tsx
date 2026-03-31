import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import OrgStructure from "./pages/OrgStructure";
import Departments from "./pages/Departments";
import DepartmentDashboard from "./pages/DepartmentDashboard";
import ProjectStaff from "./pages/ProjectStaff";
import ProjectDetails from "./pages/ProjectDetails";
import ProjectDocuments from "./pages/ProjectDocuments";
import ProjectForm from "./pages/ProjectForm";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/org-structure" element={<OrgStructure />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/departments/:departmentId" element={<DepartmentDashboard />} />
          <Route path="/departments/:departmentId/staff" element={<ProjectStaff />} />
          <Route path="/departments/:departmentId/details" element={<ProjectDetails />} />
          <Route path="/departments/:departmentId/documents" element={<ProjectDocuments />} />
          <Route path="/departments/:departmentId/projects/new" element={<ProjectForm />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
