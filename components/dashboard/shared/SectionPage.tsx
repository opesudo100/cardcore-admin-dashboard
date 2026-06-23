"use client";

import { usePathname } from "next/navigation";
import type { IconName } from "@/types/dashboard.types";
import { DashboardCard } from "@/components/dashboard/shared/DashboardCard";
import { Icon } from "@/components/ui/Icon";

type SectionVariant = {
  metrics: Array<{
    label: string;
    value: string;
    icon: IconName;
    tint?: string;
  }>;

  rows: Array<{
    label: string;
    value: string;
    status: string;
  }>;
};

const pageVariants: Record<
  string,
  {
    cardcore: SectionVariant;
    cloudcard: SectionVariant;
  }
> = {
  institutions: {
    cardcore: {
      metrics: [
        {
          label: "Issuer institutions",
          value: "18",
          icon: "building",
          tint: "#f1f0ff",
        },

        {
          label: "Linked card programs",
          value: "0",
          icon: "cards",
        },
      ],

      rows: [
        {
          label: "BIN sponsorship",
          value: "Ready for setup",
          status: "Pending",
        },

        {
          label: "Card program approvals",
          value: "0 active programs",
          status: "Draft",
        },

        {
          label: "HSM relationship",
          value: "Keys required",
          status: "Action",
        },

        {
          label: "Card issuance status",
          value: "74 cards",
          status: "Active",
        },
      ],
    },

    cloudcard: {
      metrics: [
        {
          label: "Client institutions",
          value: "135",
          icon: "building",
          tint: "#f1f0ff",
        },

        {
          label: "Billing contacts",
          value: "100+",
          icon: "users",
        },
      ],

      rows: [
        {
          label: "Client onboarding",
          value: "Acme Inc One",
          status: "Issuer",
        },

        {
          label: "Invoice profile",
          value: "Payment invoice enabled",
          status: "Ready",
        },

        {
          label: "User access",
          value: "Institution admins",
          status: "Active",
        },

        {
          label: "Commercial status",
          value: "Billing review",
          status: "Open",
        },
      ],
    },
  },

  settings: {
    cardcore: {
      metrics: [
        {
          label: "HSM environments",
          value: "1",
          icon: "server",
          tint: "#f1f0ff",
        },

        {
          label: "Key policies",
          value: "3",
          icon: "key",
        },
      ],

      rows: [
        {
          label: "Key ceremony",
          value: "CardCore security",
          status: "Required",
        },

        {
          label: "Card controls",
          value: "Physical and virtual",
          status: "Enabled",
        },

        {
          label: "Transaction rules",
          value: "Program level",
          status: "Active",
        },

        {
          label: "Issuer settings",
          value: "Institution managed",
          status: "Ready",
        },
      ],
    },

    cloudcard: {
      metrics: [
        {
          label: "Billing preferences",
          value: "4",
          icon: "receipt",
          tint: "#eefaf6",
        },

        {
          label: "User roles",
          value: "12",
          icon: "users",
        },
      ],

      rows: [
        {
          label: "Invoice workflow",
          value: "CloudCard billing",
          status: "Enabled",
        },

        {
          label: "Client notifications",
          value: "Email reminders",
          status: "Active",
        },

        {
          label: "Workspace users",
          value: "Institution operators",
          status: "Managed",
        },

        {
          label: "Payment settings",
          value: "Pending and completed",
          status: "Ready",
        },
      ],
    },
  },
};

function getFallbackVariant(
  workspaceName: string
): SectionVariant {
  return {
    metrics: [
      {
        label: `${workspaceName} records`,
        value: workspaceName === "CardCore" ? "74" : "135",
        icon: "trend",
      },

      {
        label: "Active this month",
        value:
          workspaceName === "CardCore"
            ? "58"
            : "100+",
        icon: "building",
        tint: "#f1f0ff",
      },
    ],

    rows: [
      {
        label: "Primary account",
        value: workspaceName,
        status: "Active",
      },

      {
        label: "Operations queue",
        value:
          workspaceName === "CardCore"
            ? "Issuer operations"
            : "Client operations",
        status: "Open",
      },

      {
        label: "Approval status",
        value:
          workspaceName === "CardCore"
            ? "Program review"
            : "Billing review",
        status: "Ready",
      },

      {
        label: "Last updated",
        value: "Today",
        status: "Current",
      },
    ],
  };
}

export function SectionPage({
  title,
  icon = "apps",
}: {
  title: string;
  icon?: IconName;
}) {
  const pathname = usePathname();

  const isCloudCard =
    pathname.includes("/cloudcard");

  const workspaceKey = isCloudCard
    ? "cloudcard"
    : "cardcore";

  const workspaceName = isCloudCard
    ? "CloudCard"
    : "CardCore";

  const activeSection =
    pathname.split("/")[2] || "dashboard";

  const variant =
    pageVariants[activeSection]?.[
      workspaceKey
    ] ?? getFallbackVariant(workspaceName);

  return (
    <section className="bg-white rounded-[12px] sm:rounded-[18px] lg:rounded-[24px] p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <Icon name={icon} />

        <h2 className="text-[20px] sm:text-[24px] font-[800] leading-tight">
          {title}
        </h2>
      </div>

      {/* Metrics */}
      <div className="dashboard-card-grid">
        {variant.metrics.map((metric) => (
          <DashboardCard
            key={metric.label}
            metric={metric}
          />
        ))}
      </div>

      {/* Table */}
      <div className="mt-6 sm:mt-8 flex flex-col gap-3 sm:gap-4">
        {variant.rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-2 border border-[#F3F4F6] rounded-[12px] px-4 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-4 sm:rounded-[16px] sm:px-6 sm:py-5"
          >
            <span className="font-[600] text-[#111827]">
              {row.label}
            </span>

            <strong className="text-[#374151] break-words">
              {row.value}
            </strong>

            <small className="text-[#6B7280] font-[600]">
              {row.status}
            </small>
          </div>
        ))}
      </div>
    </section>
  );
}
