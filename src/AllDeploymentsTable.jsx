import { Badge } from "./components/ui/badge";
import { format, intervalToDuration } from "date-fns";
import React, {
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { Table, TableContainer, TableHeader, TableRow } from "./components/table/TableComponents";
import {
  MagnifyingGlassIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
  CpuChipIcon,
  BoltIcon
} from "@heroicons/react/24/outline";
import SidePanel from "./components/sidePanel/SidePanel";
import useDebounce from "./useDebounce";
import PageTitle from "./components/Typography/PageTitle";
import NoDataTable from "./components/table/NoDataTable";
import { SidebarContext, useAuthContext } from "./App";
import { UserDiscontinued } from "./components/nav/Nav";
import { secondsToString } from "./components/meetings/sessions/SessionsTable";
import NoTelephonyCalls from "./NoTelephonyCalls";
import Nodata from "./Nodata";

// Mock useRouter
const useRouter = () => {
  return {
    push: (url) => console.log("Navigate to:", url),
    replace: (url) => console.log("Replace URL with:", url),
    query: {},
    pathname: "/",
    isReady: true
  };
};

const router = {
  push: (url) => console.log("Navigate to:", url),
  replace: (url) => console.log("Replace URL with:", url),
  query: {}
};

const actions = Object.freeze({
  pageChange: "PAGE_CHANGE",
  perPageChange: "PER_PAGE_CHANGE",
  queryChange: "QUERY_CHANGE",
  filterChange: "FILTER_CHANGE",
  dateChange: "DATE_CHANGE",
  clearFilters: "CLEAR_FILTERS",
});

export function FormatDate(isoDateString) {
  const date = new Date(isoDateString);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const day = date.getDate().toString().padStart(2, "0");
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  const time = `${hours}:${minutes} ${ampm}`;
  return `${day} ${month} ${year} ${time}`;
}

const duration = (finishedAt, startedAt) => {
  if (!finishedAt || !startedAt) return "-";
  const duration = intervalToDuration({
    start: new Date(startedAt),
    end: new Date(finishedAt),
  });
  const totalSeconds =
    duration.days * 24 * 60 * 60 +
    duration.hours * 3600 +
    duration.minutes * 60 +
    duration.seconds;
  return totalSeconds === 0 ? `-` : secondsToString(totalSeconds);
};

export const RefreshButton = ({ refetch }) => {
  return (
    <button
      onClick={refetch}
      style={{ padding: "10px 8px" }}
      className={`w-full justify-center inline-flex mr-3 items-center text-xs font-semibold hover-text-bg  rounded-md shadow-md focus:outline-none border-gray-600 hover-text-bg-fill border border-transparent sm:ml-3 sm:w-auto sm:text-sm text-white bg-gray-800`}
    >
      <p className="text-md font-normal">Refresh Data</p>
    </button>
  );
};

const TableBody = ({ children, isLoading }) => {
  return (
    <tbody
      className={`divide-y divide-gray-700 border-b border-gray-700 justify-start text-white transition-all ${isLoading ? "opacity-50" : "opacity-100"
        }`}
    >
      {children}
    </tbody>
  );
};

export function getDifferenceInDays(date) {
  const newDate = new Date();
  const oldDate = new Date(date);
  const diffTime = Math.abs(newDate - oldDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export const LoadingTableSkeleton = ({ index }) => {
  return (
    <tr key={index} className={`w-full hover:bg-gray-800`}>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <td key={i} className={`px-3 py-3 `}>
          <div className="w-full ">
            <div className="h-10 w-full bg-gray-600 rounded animate-pulse" />
          </div>
        </td>
      ))}
    </tr>
  );
};

export const Row = ({ row, onRowClick }) => {
  const [open, setOpen] = useState(false);
  const [isMouseEnter, setIsMouseEnter] = useState(false);
  const router = useRouter();

  const onClose = () => {
    setOpen(false);
  };

  const handleOnMouseEnter = () => {
    setIsMouseEnter(true);
  };

  const handleOnMouseLeave = () => {
    setIsMouseEnter(false);
  };

  const showSidebar = () => {
    return (
      <div
        className="md:ml-20 xl:ml-16 flex items-center justify-center relative hover:cursor-pointer"
        onClick={() => {
          onRowClick(row);
        }}
      >
        {isMouseEnter ? (
          <p className=" absolute whitespace-nowrap right-5 text-purple-350 text-sm mb-0">
            View Analytics
          </p>
        ) : (
          <div className="absolute" />
        )}
        <ChevronRightIcon
          className={`w-5 h-5 ${isMouseEnter ? "text-purple-350" : "text-white"
            }`}
          strokeWidth={2.5}
        />
      </div>
    );
  };

  return (
    <>
      <TableRow
        onMouseEnterAction={handleOnMouseEnter}
        onMouseLeaveAction={handleOnMouseLeave}
        columns={[
          {
            text: (
              <div className="flex flex-col gap-1 cursor-pointer" onClick={() => onRowClick(row)}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white group-hover:text-vsdk-primary transition-colors">{row.name}</span>
                  <div className={`w-2 h-2 rounded-full ${row.health === 'Unhealthy' ? 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`} />
                </div>
                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{row.id.slice(0, 12)}...</span>
              </div>
            )
          },
          {
            text: (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-300 font-mono truncate max-w-[150px]">{row.image}</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{row.currentTag}</span>
              </div>
            )
          },

          {
            text: (
              <div className="flex items-center gap-2 px-2 py-1 bg-vsdk-bg border border-vsdk-border rounded text-[10px] font-bold text-gray-400 uppercase tracking-widest w-fit">
                <CpuChipIcon className="w-3 h-3" />
                {row.resourceProfile}
              </div>
            )
          },
          {
            text: (
              <div className="flex flex-col gap-2">
                <div className="flex gap-1">
                  {[...Array(row.replicas?.max || 5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${i < (row.replicas?.current || 0) ? 'bg-vsdk-primary shadow-[0_0_5px_rgba(205,182,255,0.5)]' : 'bg-gray-800'}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  {row.replicas?.current || 0} of {row.replicas?.max || 0} Running
                </span>
              </div>
            )
          },
          {
            text: (
              <div className="flex flex-col">
                <span className="text-xs text-gray-300">{FormatDate(row.lastUpdated)}</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Last Updated</span>
              </div>
            )
          },
          {
            text: (
              <div className="relative group/menu">
                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-all">
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-32 bg-vsdk-card border border-vsdk-border rounded-xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 overflow-hidden">
                  <button className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-widest">
                    Restart
                  </button>
                  <button className="w-full px-4 py-2.5 text-left text-xs font-bold text-danger hover:bg-danger/10 transition-colors uppercase tracking-widest border-t border-vsdk-border">
                    Delete
                  </button>
                </div>
              </div>
            )
          },
        ]}
      />

      <SidePanel
        open={open}
        setOpen={setOpen}
        onClose={onClose}
      >
        <div className="text-white">Sidebar Content</div>
      </SidePanel>
    </>
  );
};

export default function AllDeploymentsTable({
  reqState,
  selectedTimePeriod,
  onRowClick
}) {
  const router = useRouter();
  const auth = useAuthContext();
  const {
    annoucementVisible,
    userDiscontinuedannoucementVisible,
    otherAnnouncementVisible,
  } = useContext(SidebarContext);

  const [afterFirstLoad, setAfterFirstLoad] = useState(false);
  const userDiscontinue = auth?.state?.user?.discontinued;

  const { isLoading, response } = reqState || {};

  function reducer(state, action) {
    switch (action.type) {
      case actions.pageChange:
        return { ...state, page: action.payload };
      case actions.perPageChange:
        return { ...state, perPage: action.payload, page: 1 };
      case actions.queryChange:
        if (state.query === action.payload) return state;
        return { ...state, query: action.payload, page: 1 };
      case actions.filterChange:
        return { ...state, userId: action.payload, page: 1 };
      case actions.dateChange:
        return {
          ...state,
          startDate: +new Date(action.payload.startDate),
          endDate: +new Date(action.payload.endDate),
          page: 1,
        };
      case actions.clearFilters:
        return {
          ...state,
          query: "",
          startDate: "",
          endDate: "",
          page: 1,
        };
      default:
        throw new Error("No such reducer action");
    }
  }

  const [state, dispatch] = useReducer(reducer, {
    page: 1,
    perPage: 20,
    query: "",
    userId: "",
    startDate: "",
    endDate: "",
  });

  const refetch = () => {
    console.log("Refetch triggered");
  };

  const [keyword, searchTerm, setSearchTerm] = useDebounce(state.query, 500);

  useEffect(() => {
    dispatch({ type: actions.queryChange, payload: keyword });
  }, [keyword]);

  useEffect(() => {
    setTimeout(() => {
      setAfterFirstLoad(true);
    }, 1000);
  }, []);

  const columns = [
    { title: "Agent & Status" },
    { title: "Current Image" },
    { title: "Resource Profile" },
    { title: "Replicas" },
    { title: "Last Updated" },
    { title: "" },
  ];

  const defaultAction = useMemo(
    () => ({ sessionId: "" }),
    []
  );

  return (
    <>
      <div
        className={"py-3"}
        style={{
          height: `calc(100vh - 180px)`,
        }}
      >
        {userDiscontinue === UserDiscontinued.ORG_DEACTIVED ? (
          <NoDataTable
            message={"Your account has been deactivated."}
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHeader columns={columns} />
              <TableBody isLoading={isLoading}>
                {isLoading ? (
                  <>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <LoadingTableSkeleton key={i} index={i} />
                    ))}
                  </>
                ) : response?.data?.length > 0 ? (
                  response?.data?.map((row, i) => {
                    return (
                      <Row
                        key={`${row.id || "no-id"}-${row.tag || "no-tag"}-${row.createdAt || i
                          }`}
                        row={row}
                        auth={auth}
                        refetch={refetch}
                        isLoading={isLoading}
                        defaultAction={defaultAction}
                        onRowClick={onRowClick}
                      />
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={columns?.length || 1}
                      className="p-0"
                    >
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                          <p className="text-xl text-gray-300 mt-2">
                            No deployments found.
                          </p>
                          <div className="mt-4 flex flex-col items-center justify-center">
                            <Nodata />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </>
  );
}
