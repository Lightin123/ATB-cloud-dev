import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu.tsx";
import { Button } from "../ui/button.tsx";
import { Building2, MoreHorizontal, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dateParser, moneyParser } from "../../utils/formatters";
import { Unit } from "../../utils/classes.ts";
import { DataTable } from "../ui/data-table.jsx";
import { ListingStatusBadge } from "../../utils/statusBadges.jsx";
import Link from "../general/Link.tsx";
import EditRentalUnit from "./EditRentalUnit";
import { useState } from "react";

const RentalTableDropdown = ({ unit }) => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <DropdownMenu>
      <EditRentalUnit
        unit={unit}
        open={modalOpen}
        setOpen={() => setModalOpen(!modalOpen)}
      />
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setModalOpen(true)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate(`/properties/${unit.realEstateObjectId}`)}
        >
          <Building2 className="h-4 w-4 mr-2" />
          View Property
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const columns: ColumnDef<Unit>[] = [
  {
    id: "unit",
    header: "Unit Identifier",
    cell: ({ row }) => <Link id={row.original.id} type={"unit"} />,
    meta: { type: "string" },
    accessorFn: (row) => row.unitIdentifier,
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "property",
    header: "Property",
    enableSorting: true,
    meta: { type: "string" },
    cell: ({ row }) => {
      const property = row?.original?.realEstateObject;
      return (
        <div className="capitalize font-400">{property?.title}</div>
      );
    },
    accessorFn: (row) => row.realEstateObject.title,
  },
  {
    id: "status",
    header: "Status",
    enableSorting: true,
    meta: { type: "string" },
    cell: ({ row }) => (
      <ListingStatusBadge status={row.original.status} />
    ),
    accessorFn: (row) => row.status,
  },
  {
    id: "currentTenant",
    header: "Current Tenant",
    enableSorting: true,
    meta: { type: "string" },
    cell: ({ row }) => {
      if (row?.original?.tenantId) {
        return <Link id={row.original.tenantId} type={"tenant"} />;
      }
      return "No Tenant";
    },
    accessorFn: (row) => {
      const tenant = row?.tenant as { firstName?: string; lastName?: string } | undefined;
      const firstName = tenant?.firstName ?? "";
      const lastName = tenant?.lastName ?? "";
      return `${firstName} ${lastName}`.trim();
    },
  },
  {
    id: "leaseStartDate",
    header: "Lease Start Date",
    enableSorting: true,
    meta: { type: "date" },
    cell: ({ row }) => {
      const leases = row.original.leases;
      if (leases?.length && leases[0]?.startDate) {
        return <div>{dateParser(leases[0].startDate)}</div>;
      }
      return "";
    },
    accessorFn: (row) => row.leases[0]?.startDate ?? undefined,
  },
  {
    id: "leaseEndDate",
    header: "Lease End Date",
    enableSorting: true,
    meta: { type: "date" },
    cell: ({ row }) => {
      const leases = row.original.leases;
      if (leases?.length && leases[0]?.endDate) {
        return <div>{dateParser(leases[0].endDate)}</div>;
      }
      return "";
    },
    accessorFn: (row) => row.leases[0]?.endDate ?? undefined,
  },
  {
    id: "monthlyRent",
    header: "Monthly Rent",
    enableSorting: true,
    meta: { type: "number" },
    cell: ({ row }) => (
      <div>{moneyParser(row.original.rentalPrice)}</div>
    ),
    accessorFn: (row) => row.rentalPrice ?? undefined,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const unit = row.original;
      return <RentalTableDropdown unit={unit} />;
    },
  },
];

// eslint-disable-next-line react/prop-types
const RentalTable = ({ units, ...props }) => {
  return <DataTable data={units} columns={columns} {...props} />;
};

export default RentalTable;
