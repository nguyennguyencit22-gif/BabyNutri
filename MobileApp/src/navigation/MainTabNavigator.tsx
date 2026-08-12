import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import {
    createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import Svg, { Circle, Path } from 'react-native-svg';

import HomeScreen from '../screens/home/HomeScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import LibraryScreen from '../screens/library/LibraryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import type {
    MainTabParamList,
} from '../types/navigation/navigationBottomTypes';

import styles from '../styles/navigation/mainTabNavigatorStyles';

const Tab =
    createBottomTabNavigator<MainTabParamList>();

const TAB_BAR_WIDTH_RATIO = 0.80;
const tabBarHorizontalMargin =
    `${((1 - TAB_BAR_WIDTH_RATIO) / 2) * 100}%` as const;

const PILL_HEIGHT = 58;
const PILL_BOTTOM_GAP = 10;

const HomeIcon = ({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />
    </Svg>
);

const ChatIcon = ({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </Svg>
);

const MealIcon = ({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M6 2v6M9 2v6M12 2v6M9 8v14" />
        <Path d="M18 2l-2.5 6 2.5 3v11" />
    </Svg>
);

const AccountIcon = ({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <Circle cx="12" cy="7" r="4" />
    </Svg>
);

const TabBarBackground = () => {
    const { width } = useWindowDimensions();
    const pillMargin = (width * (1 - TAB_BAR_WIDTH_RATIO)) / 2;

    return (
        <View style={styles.backdrop}>
            {/* <BlurView
                style={styles.blurFill}
                blurType="light"
                blurAmount={16}
                reducedTransparencyFallbackColor="#FFFDF9"
            /> */}

            <View
                style={[
                    styles.pill,
                    {
                        left: pillMargin,
                        right: pillMargin,
                    },
                ]}
            />
        </View>
    );
};

const TabIcon = ({
    focused,
    color,
    size,
    IconComponent,
}: {
    focused: boolean;
    color: string;
    size: number;
    IconComponent: React.ComponentType<{ size?: number; color?: string }>;
}) => (
    <View style={styles.iconWrapper}>
        <IconComponent
            color={color}
            size={size}
        />
        <View
            style={[
                styles.indicator,
                focused && styles.indicatorActive,
            ]}
        />
    </View>
);

const HomeTabIcon = ({
    focused,
    color,
    size,
}: {
    focused: boolean;
    color: string;
    size: number;
}) => (
    <TabIcon
        focused={focused}
        color={color}
        size={size}
        IconComponent={HomeIcon}
    />
);

const CommunityTabIcon = ({
    focused,
    color,
    size,
}: {
    focused: boolean;
    color: string;
    size: number;
}) => (
    <TabIcon
        focused={focused}
        color={color}
        size={size}
        IconComponent={ChatIcon}
    />
);

const LibraryTabIcon = ({
    focused,
    color,
    size,
}: {
    focused: boolean;
    color: string;
    size: number;
}) => (
    <TabIcon
        focused={focused}
        color={color}
        size={size}
        IconComponent={MealIcon}
    />
);

const ProfileTabIcon = ({
    focused,
    color,
    size,
}: {
    focused: boolean;
    color: string;
    size: number;
}) => (
    <TabIcon
        focused={focused}
        color={color}
        size={size}
        IconComponent={AccountIcon}
    />
);
function MainTabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="HomeTab"
            safeAreaInsets={{ bottom: 0 }}
            screenOptions={{
                headerShown: false,

                tabBarShowLabel: false,

                tabBarActiveTintColor: '#FFFFFF',
                tabBarInactiveTintColor: '#FFFFFF',
                tabBarActiveBackgroundColor: 'transparent',
                tabBarInactiveBackgroundColor: 'transparent',

                tabBarBackground: TabBarBackground,

                tabBarStyle: {
                    position: 'absolute',

                    left: 0,
                    right: 0,
                    bottom: 0,

                    height: PILL_HEIGHT + PILL_BOTTOM_GAP,
                    paddingHorizontal: tabBarHorizontalMargin,
                    paddingBottom: PILL_BOTTOM_GAP,

                    borderTopWidth: 0,
                    elevation: 0,
                    backgroundColor: 'transparent',
                },

                tabBarItemStyle: {
                    height: PILL_HEIGHT,
                    paddingVertical: 0,
                    paddingTop: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                },

                tabBarIconStyle: {
                    margin: 0,
                },
            }}>

            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{
                    tabBarIcon: HomeTabIcon,
                }}
            />

            <Tab.Screen
                name="CommunityTab"
                component={CommunityScreen}
                options={{
                    tabBarIcon: CommunityTabIcon,
                }}
            />

            <Tab.Screen
                name="LibraryTab"
                component={LibraryScreen}
                options={{
                    tabBarIcon: LibraryTabIcon,
                }}
            />

            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ProfileTabIcon,
                }}
            />
        </Tab.Navigator>
    );
}

export default MainTabNavigator;