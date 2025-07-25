import { Button } from "../ui/button";
import { LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { makeSelectObjectById } from "../../services/slices/objectSlice";

function getTenantName(tenant: any) {
  if (!tenant) return null;
  const name =
    (tenant.firstName && tenant.lastName && `${tenant.firstName} ${tenant.lastName}`) ||
    tenant.name ||
    `Tenant ${tenant.id}`;
  return name;
}

type LinkProps = {
  id: number;
  type: "unit" | "tenant" | "lease" | "property";
  [key: string]: any;
};

const Link = ({ type, id, ...props }: LinkProps) => {
  const navigate = useNavigate();

  // ✅ use factory selector
  const object = useSelector(makeSelectObjectById(id, type));

  let label = `#${id}`;
  let link = "";

  switch (type) {
    case "unit":
      label = object?.unitIdentifier || `Unit ${id}`;
      link = `/rentals/${id}`;
      break;
    case "tenant":
      label = getTenantName(object);
      link = `/tenants/${id}`;
      break;
    case "lease":
      label = `Lease ${id}`;
      link = `/leases/${id}`;
      break;
    case "property":
      label = object?.title || `Property ${id}`;
      link = `/properties/${id}`;
      break;
  }

  return (
    <Button
      className="pl-0 text-foreground group"
      variant="link"
      onClick={() => navigate(link)}
      {...props}
    >
      <LinkIcon className="w-4 h-4 mr-1 transform transition-transform duration-300 group-hover:rotate-[180deg]" />
      {label}
    </Button>
  );
};

export default Link;
