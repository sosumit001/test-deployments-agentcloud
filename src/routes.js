import {
    HomeIcon,
    UsersIcon,
    VideoCameraIcon,
    KeyIcon,
    UserIcon,
    PhoneIcon,
    ChartBarIcon,
    PlayCircleIcon,
    ArrowTopRightOnSquareIcon,
    UserGroupIcon,
    CloudArrowUpIcon,
    Squares2X2Icon,
    Bars3CenterLeftIcon,
    PhoneArrowDownLeftIcon,
    PhoneArrowUpRightIcon,
    BuildingOfficeIcon,
    BanknotesIcon,
    ArrowRightStartOnRectangleIcon
} from "@heroicons/react/24/outline";

// Mock other icons that were imported from local files
const MeetingIcon = VideoCameraIcon;
const CharacterBotIcon = UserIcon;
const AgentBotIconActive = UserGroupIcon;
const CharacterBrainIcon = CloudArrowUpIcon;

export const GetRoutes = () => {
    return {
        dashboard: {
            label: "Dashboard",
            Icon: HomeIcon,
            href: "#",
            route: "/dashboard"
        },
        meetings: {
            label: "Meetings",
            Icon: MeetingIcon,
            href: "#",
            route: "/meetings",
            subRoutes: [
                { label: "Analytics", Icon: ChartBarIcon, href: "#" },
                { label: "Sessions", Icon: UsersIcon, href: "#" },
                { label: "Recordings", Icon: VideoCameraIcon, href: "#" },
                { label: "HLS", Icon: PlayCircleIcon, href: "#" },
                { label: "RTMP Simulcast", Icon: VideoCameraIcon, href: "#" },
                { label: "API Reference", Icon: ArrowTopRightOnSquareIcon, href: "#" }
            ]
        },
        telephony: {
            label: "Telephony",
            Icon: PhoneIcon,
            href: "#",
            route: "/telephony",
            subRoutes: [
                { label: "Calls", Icon: PhoneIcon, href: "#" },
                { label: "Inbound Gateway", Icon: PhoneArrowDownLeftIcon, href: "#" },
                { label: "Outbound Gateway", Icon: PhoneArrowUpRightIcon, href: "#" },
                { label: "Routing Rules", Icon: Bars3CenterLeftIcon, href: "#" },
                { label: "Webhooks", Icon: CloudArrowUpIcon, href: "#" },
                { label: "Documentation", Icon: ArrowTopRightOnSquareIcon, href: "#" }
            ]
        },
        agents: {
            label: "AI Agent",
            Icon: AgentBotIconActive,
            href: "#",
            route: "/agents",
            subRoutes: [
                { label: "Agents", Icon: AgentBotIconActive, href: "#", newLabel: "Beta" },
                { label: "Knowledge Base", Icon: CharacterBrainIcon, href: "#" }
            ],
            additionalRoutes: [
                { label: "Agents", Icon: CloudArrowUpIcon, href: "#", active: true }, // Mark as active
                { label: "Documentation", Icon: ArrowTopRightOnSquareIcon, href: "#" }
            ]
        },
        apiKey: {
            label: "API Keys",
            Icon: KeyIcon,
            href: "#",
            route: "/api-keys"
        },
        profile: {
            label: "Profile",
            Icon: UserIcon,
            href: "#",
            route: "/profile",
            subRoutes: [
                { label: "General", Icon: UserIcon, href: "#" },
                { label: "Org Settings", Icon: BuildingOfficeIcon, href: "#" },
                { label: "Teams", Icon: UsersIcon, href: "#" },
                { label: "Billing", Icon: BanknotesIcon, href: "#" },
                { label: "Logout", Icon: ArrowRightStartOnRectangleIcon, href: "#" }
            ]
        }
    };
};
