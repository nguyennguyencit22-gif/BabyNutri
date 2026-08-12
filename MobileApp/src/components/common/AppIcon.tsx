import React from 'react';
import { Image, ImageSourcePropType } from 'react-native';
import Svg, { Circle, Path, Rect, Line } from 'react-native-svg';

// Drop-in replacement for react-native-paper's <Icon source={...} size={...} color={...} />.
// react-native-paper's Icon relies on a vector-icon font that isn't linked on Android in
// this project (@react-native-vector-icons/material-design-icons autolinking is disabled
// to dodge a Windows 260-char CMake path limit — see react-native.config.js), so every
// named icon rendered a tofu box there. This renders the same MaterialCommunityIcons names
// as hand-drawn inline SVG instead, which has no native/font dependency.

type Props = {
    source: string | { uri: string } | ImageSourcePropType;
    size: number;
    color?: string;
    style?: any;
};

const glyphs: Record<string, (color: string) => React.ReactNode> = {
    plus: (c) => <Path stroke={c} strokeWidth={2.2} strokeLinecap="round" d="M12 5v14M5 12h14" />,
    minus: (c) => <Path stroke={c} strokeWidth={2.2} strokeLinecap="round" d="M5 12h14" />,
    close: (c) => <Path stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />,
    check: (c) => <Path stroke={c} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />,
    'check-circle': (c) => <>
        <Circle cx={12} cy={12} r={9} stroke={c} strokeWidth={2} fill="none" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M8.5 12.5l2.3 2.3L15.5 9.5" />
    </>,
    'check-circle-outline': (c) => <>
        <Circle cx={12} cy={12} r={9} stroke={c} strokeWidth={2} fill="none" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M8.5 12.5l2.3 2.3L15.5 9.5" />
    </>,
    'chevron-right': (c) => <Path stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />,
    'chevron-left': (c) => <Path stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />,
    'chevron-up': (c) => <Path stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" d="M6 15l6-6 6 6" />,
    'chevron-down': (c) => <Path stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />,
    'arrow-left': (c) => <Path stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />,
    'dots-vertical': (c) => <>
        <Circle cx={12} cy={5} r={1.6} fill={c} />
        <Circle cx={12} cy={12} r={1.6} fill={c} />
        <Circle cx={12} cy={19} r={1.6} fill={c} />
    </>,
    'dots-horizontal': (c) => <>
        <Circle cx={5} cy={12} r={1.6} fill={c} />
        <Circle cx={12} cy={12} r={1.6} fill={c} />
        <Circle cx={19} cy={12} r={1.6} fill={c} />
    </>,
    drag: (c) => <>
        <Circle cx={9} cy={6} r={1.4} fill={c} /><Circle cx={15} cy={6} r={1.4} fill={c} />
        <Circle cx={9} cy={12} r={1.4} fill={c} /><Circle cx={15} cy={12} r={1.4} fill={c} />
        <Circle cx={9} cy={18} r={1.4} fill={c} /><Circle cx={15} cy={18} r={1.4} fill={c} />
    </>,

    'clock-outline': (c) => <>
        <Circle cx={12} cy={12} r={9} stroke={c} strokeWidth={2} fill="none" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3.5 2" />
    </>,
    calendar: (c) => <>
        <Rect x={3} y={4} width={18} height={18} rx={2} stroke={c} strokeWidth={2} fill="none" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
    </>,
    'calendar-plus': (c) => <>
        <Rect x={3} y={4} width={18} height={18} rx={2} stroke={c} strokeWidth={2} fill="none" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18M12 14v6M9 17h6" />
    </>,
    'calendar-month-outline': (c) => <>
        <Rect x={3} y={4} width={18} height={18} rx={2} stroke={c} strokeWidth={2} fill="none" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
        <Circle cx={8} cy={15} r={1} fill={c} /><Circle cx={12} cy={15} r={1} fill={c} /><Circle cx={16} cy={15} r={1} fill={c} />
    </>,
    'calendar-edit': (c) => <>
        <Rect x={3} y={4} width={18} height={18} rx={2} stroke={c} strokeWidth={2} fill="none" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M14.5 15.5L18 14l-1 3.5L13 21l-.5-3.5z" />
    </>,
    history: (c) => <>
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M3 3v5h5" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M3.05 13A9 9 0 106 5.3L3 8" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l4 2" />
    </>,

    'delete-outline': (c) => <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />,
    'trash-can-outline': (c) => <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />,
    'pencil-outline': (c) => <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5z" />,
    pencil: (c) => <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5z" />,
    'content-save-outline': (c) => <>
        <Path stroke={c} strokeWidth={2} strokeLinejoin="round" d="M5 3h11l3 3v15H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
        <Rect x={7} y={3} width={7} height={5} stroke={c} strokeWidth={2} fill="none" />
        <Rect x={7} y={13} width={10} height={7} stroke={c} strokeWidth={2} fill="none" />
    </>,

    heart: (c) => <Path fill={c} d="M12 21s-7.5-4.9-10-9.3C.4 8.4 2 5 5.4 5c2 0 3.3 1 4.6 2.6C11.3 6 12.6 5 14.6 5 18 5 19.6 8.4 22 11.7 19.5 16.1 12 21 12 21z" />,
    'heart-outline': (c) => <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />,
    star: (c) => <Path fill={c} d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />,
    'star-outline': (c) => <Path stroke={c} strokeWidth={2} strokeLinejoin="round" fill="none" d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />,
    bookmark: (c) => <Path fill={c} d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" />,
    'bookmark-outline': (c) => <Path stroke={c} strokeWidth={2} strokeLinejoin="round" fill="none" d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" />,

    'share-variant': (c) => <>
        <Circle cx={18} cy={5} r={2.5} stroke={c} strokeWidth={2} fill="none" />
        <Circle cx={6} cy={12} r={2.5} stroke={c} strokeWidth={2} fill="none" />
        <Circle cx={18} cy={19} r={2.5} stroke={c} strokeWidth={2} fill="none" />
        <Path stroke={c} strokeWidth={2} d="M8.2 10.7L15.8 6.3M8.2 13.3l7.6 4.4" />
    </>,
    send: (c) => <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />,
    magnify: (c) => <>
        <Circle cx={10.5} cy={10.5} r={7} stroke={c} strokeWidth={2} fill="none" />
        <Line x1={21} y1={21} x2={15.8} y2={15.8} stroke={c} strokeWidth={2} strokeLinecap="round" />
    </>,

    'baby-face-outline': (c) => <>
        <Circle cx={12} cy={12} r={9} stroke={c} strokeWidth={2} fill="none" />
        <Circle cx={9} cy={11} r={1} fill={c} /><Circle cx={15} cy={11} r={1} fill={c} />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M9 15c1 1 5 1 6 0" />
    </>,
    'head-outline': (c) => <>
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" d="M6 20v-2a4 4 0 014-4h1a5 5 0 005-5V8a5 5 0 00-10 0" />
        <Circle cx={16.5} cy={8.5} r={1} fill={c} />
    </>,

    'silverware-fork-knife': (c) => <>
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M7 2v8M5 2v5a2 2 0 002 2 2 2 0 002-2V2M7 12v10M17 2c-1.5 0-3 2-3 5s1.5 5 3 5v9" />
    </>,
    'bowl-mix-outline': (c) => <>
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M3 11h18a9 6 0 01-18 0z" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M12 11V4M9 6l3-2 3 2" />
    </>,
    'food-apple-outline': (c) => <>
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" d="M12 8c-3.5 0-6 2.7-6 6.5S8.5 21 11 21c.7 0 1-.3 1.5-.3s.8.3 1.5.3c2.5 0 5-2.7 5-6.5S15.5 8 12 8z" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M12 8c0-2 1-3.5 3-4" />
    </>,

    'shield-check-outline': (c) => <>
        <Path stroke={c} strokeWidth={2} strokeLinejoin="round" fill="none" d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </>,
    'shield-alert-outline': (c) => <>
        <Path stroke={c} strokeWidth={2} strokeLinejoin="round" fill="none" d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M12 8v4" />
        <Circle cx={12} cy={15.5} r={0.8} fill={c} />
    </>,
    'alert-circle-outline': (c) => <>
        <Circle cx={12} cy={12} r={9} stroke={c} strokeWidth={2} fill="none" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M12 8v5" />
        <Circle cx={12} cy={16} r={0.8} fill={c} />
    </>,
    'help-circle-outline': (c) => <>
        <Circle cx={12} cy={12} r={9} stroke={c} strokeWidth={2} fill="none" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M9.5 9a2.5 2.5 0 114 2c-.8.6-1.5 1.1-1.5 2.5" />
        <Circle cx={12} cy={17} r={0.8} fill={c} />
    </>,
    'lock-outline': (c) => <>
        <Rect x={5} y={11} width={14} height={10} rx={2} stroke={c} strokeWidth={2} fill="none" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" fill="none" d="M8 11V7a4 4 0 018 0v4" />
    </>,
    earth: (c) => <>
        <Circle cx={12} cy={12} r={9} stroke={c} strokeWidth={2} fill="none" />
        <Path stroke={c} strokeWidth={1.6} d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" />
    </>,

    'comment-outline': (c) => <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
    'chart-line': (c) => <>
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M18.7 8l-5.1 5.2-4-4L3 15.6" />
    </>,
    calculator: (c) => <>
        <Rect x={4} y={2} width={16} height={20} rx={2} stroke={c} strokeWidth={2} fill="none" />
        <Rect x={7} y={5} width={10} height={4} stroke={c} strokeWidth={2} fill="none" />
        <Circle cx={7.5} cy={13.5} r={1} fill={c} /><Circle cx={12} cy={13.5} r={1} fill={c} /><Circle cx={16.5} cy={13.5} r={1} fill={c} />
        <Circle cx={7.5} cy={17.5} r={1} fill={c} /><Circle cx={12} cy={17.5} r={1} fill={c} /><Circle cx={16.5} cy={17.5} r={1} fill={c} />
    </>,
    ruler: (c) => <>
        <Rect x={2.5} y={7} width={19} height={10} rx={1} stroke={c} strokeWidth={2} fill="none" transform="rotate(-45 12 12)" />
        <Path stroke={c} strokeWidth={1.6} strokeLinecap="round" d="M6 9l2 2M9 6l2 2M12 3l2 2" />
    </>,
    'scale-bathroom': (c) => <>
        <Rect x={3} y={3} width={18} height={18} rx={2} stroke={c} strokeWidth={2} fill="none" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M12 7v10M8 17h8" />
    </>,

    'notebook-outline': (c) => <>
        <Rect x={4} y={3} width={16} height={18} rx={2} stroke={c} strokeWidth={2} fill="none" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M8 3v18M4 7h4M4 11h4M4 15h4" />
    </>,
    'newspaper-plus': (c) => <>
        <Rect x={3} y={4} width={13} height={16} rx={1} stroke={c} strokeWidth={2} fill="none" />
        <Path stroke={c} strokeWidth={1.6} strokeLinecap="round" d="M6 8h7M6 11h7M6 14h4" />
        <Circle cx={19} cy={17} r={4} fill="#fff" stroke={c} strokeWidth={2} />
        <Path stroke={c} strokeWidth={1.6} strokeLinecap="round" d="M19 15.3v3.4M17.3 17h3.4" />
    </>,
    'lightbulb-on-outline': (c) => <>
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.5.4.9 1.1.9 1.9v.2h5.2v-.2c0-.8.4-1.5.9-1.9A6 6 0 0012 3z" />
    </>,
    'format-list-bulleted': (c) => <>
        <Circle cx={4} cy={6} r={1.2} fill={c} /><Circle cx={4} cy={12} r={1.2} fill={c} /><Circle cx={4} cy={18} r={1.2} fill={c} />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M9 6h12M9 12h12M9 18h12" />
    </>,
    'flag-outline': (c) => <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" d="M5 21V4a1 1 0 011-1h11l-2.5 4.5L19.5 12H6" />,
    fire: (c) => <Path fill={c} d="M12 2s5 5 5 10a5 5 0 01-10 0c0-1.5.6-2.5 1.3-3.5C9 10 9 12 10 12c1 0 .5-2 .5-3.5C10.5 6 12 2 12 2z" />,

    'account-plus-outline': (c) => <>
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <Circle cx={8.5} cy={7} r={4} stroke={c} strokeWidth={2} fill="none" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M20 8v6M23 11h-6" />
    </>,
    'account-group-outline': (c) => <>
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <Circle cx={9} cy={7} r={4} stroke={c} strokeWidth={2} fill="none" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" fill="none" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </>,
    'view-dashboard-edit-outline': (c) => <>
        <Rect x={3} y={3} width={7} height={9} rx={1} stroke={c} strokeWidth={2} fill="none" />
        <Rect x={14} y={3} width={7} height={5} rx={1} stroke={c} strokeWidth={2} fill="none" />
        <Rect x={14} y={12} width={7} height={9} rx={1} stroke={c} strokeWidth={2} fill="none" />
        <Rect x={3} y={16} width={7} height={5} rx={1} stroke={c} strokeWidth={2} fill="none" />
    </>,
    'bell-outline': (c) => <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />,
    'content-copy': (c) => <>
        <Rect x={9} y={9} width={12} height={12} rx={2} stroke={c} strokeWidth={2} fill="none" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" fill="none" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </>,
    'key-outline': (c) => <>
        <Circle cx={7.5} cy={15.5} r={5.5} stroke={c} strokeWidth={2} fill="none" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M21 2l-9.6 9.6M15.5 7.5L18 5M18.5 8.5L21 6" />
    </>,
    camera: (c) => <>
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <Circle cx={12} cy={13} r={4} stroke={c} strokeWidth={2} fill="none" />
    </>,
    'account-outline': (c) => <>
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" fill="none" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <Circle cx={12} cy={7} r={4} stroke={c} strokeWidth={2} fill="none" />
    </>,
    'message-text-outline': (c) => <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
    sparkles: (c) => <Path stroke={c} strokeWidth={2} strokeLinecap="round" d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2" />,
    'book-open-outline': (c) => <>
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" d="M2 5a2 2 0 012-2h5a3 3 0 013 3v14a2.5 2.5 0 00-2.5-2.5H2z" />
        <Path stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" d="M22 5a2 2 0 00-2-2h-5a3 3 0 00-3 3v14a2.5 2.5 0 012.5-2.5H22z" />
    </>,
};

const AppIcon: React.FC<Props> = ({ source, size, color = '#4B3034', style }) => {
    if (typeof source === 'object' && source !== null) {
        const uri = (source as any).uri;
        if (uri) {
            return (
                <Image
                    source={source as ImageSourcePropType}
                    style={[{ width: size, height: size }, style]}
                />
            );
        }
        return (
            <Image
                source={source as ImageSourcePropType}
                style={[{ width: size, height: size }, style]}
            />
        );
    }

    const draw = glyphs[source as string];

    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
            {draw ? draw(color) : <Circle cx={12} cy={12} r={3} fill={color} />}
        </Svg>
    );
};

export default AppIcon;
