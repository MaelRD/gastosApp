function Svg({ children, size = 18, ...props }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {children}
    </svg>
  );
}

export const DashboardIcon = (p) => (
  <Svg {...p}><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" /><path d="M10 20v-6h4v6" /></Svg>
);
export const ParticipantsIcon = (p) => (
  <Svg {...p}><circle cx="9" cy="8" r="3" /><path d="M2.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" /><circle cx="18" cy="9" r="2.4" /><path d="M15.5 20c.2-2.6 1.8-4.7 4-5.4" /></Svg>
);
export const HistoryIcon = (p) => (
  <Svg {...p}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z" /><path d="M9 8h6M9 12h6M9 16h3" /></Svg>
);
export const BalanceIcon = (p) => (
  <Svg {...p}><path d="M12 3v18" /><path d="M5 7h14" /><path d="M5 7 2 13a3 3 0 0 0 6 0Z" /><path d="M19 7l-3 6a3 3 0 0 0 6 0Z" /></Svg>
);
export const ReportsIcon = (p) => (
  <Svg {...p}><path d="M4 20V10" /><path d="M12 20V4" /><path d="M20 20v-7" /></Svg>
);
export const ProfileIcon = (p) => (
  <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></Svg>
);
export const SettingsIcon = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></Svg>
);
export const PlusIcon = (p) => (<Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>);
export const BackIcon = (p) => (<Svg {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Svg>);
export const SunIcon = (p) => (<Svg {...p}><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></Svg>);
export const MoonIcon = (p) => (<Svg {...p} fill="currentColor" stroke="none"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" /></Svg>);
export const EditIcon = (p) => (<Svg {...p}><path d="M4 20l1-4L16 5l3 3L8 19l-4 1Z" /></Svg>);
export const TrashIcon = (p) => (<Svg {...p}><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /></Svg>);
export const ArrowRightIcon = (p) => (<Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>);
