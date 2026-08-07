import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Path } from 'react-native-svg';

import HomeScreen from '../screens/home/HomeScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import LibraryScreen from '../screens/library/LibraryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import type { MainTabParamList } from '../types/navigation/navigationBottomTypes';
import styles from '../styles/navigation/mainTabNavigatorStyles';

// SVG Tab Icons
const HomeOutline = ({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <Path d="M9 22V12h6v10" />
  </Svg>
);

const HomeSolid = ({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M11.47 2.47a.75.75 0 011.06 0l9 9a.75.75 0 11-1.06 1.06l-.97-.97V21a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-5.25a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H4.5A.75.75 0 013 21V11.56l-.97.97a.75.75 0 11-1.06-1.06l9-9z" />
  </Svg>
);

const CommunityOutline = ({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </Svg>
);

const CommunitySolid = ({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path fillRule="evenodd" clipRule="evenodd" d="M4.804 21.644A.75.75 0 005.8 20.89l-.27-1.617A8.966 8.966 0 0012 21a9 9 0 10-9-9c0 1.64.439 3.177 1.205 4.507l-1.617-.27a.75.75 0 00-.754.996l2.97 4.41z" />
  </Svg>
);

const LibraryOutline = ({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z" />
  </Svg>
);

const LibrarySolid = ({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.237 8.237 0 0118 18.75c1.16 0 2.268.238 3.25.67a.75.75 0 001-.707V4.467a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
  </Svg>
);

const ProfileOutline = ({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <Path d="M12 11a4 4 0 100-8 4 4 0 000 8z" />
  </Svg>
);

const ProfileSolid = ({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path fillRule="evenodd" clipRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.6-7.812-1.7a.75.75 0 01-.437-.695z" />
  </Svg>
);

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_BAR_WIDTH_RATIO = 0.80;
const tabBarHorizontalMargin = `${((1 - TAB_BAR_WIDTH_RATIO) / 2) * 100}%` as const;

const PILL_HEIGHT = 58;
const PILL_BOTTOM_GAP = 10;

const TabBarBackground = () => {
    const { width } = useWindowDimensions();
    const pillMargin = (width * (1 - TAB_BAR_WIDTH_RATIO)) / 2;

    return (
        <View style={styles.backdrop}>
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

const HomeTabIcon = ({ focused }: { focused: boolean; color: string; size: number }) => (
    <View style={styles.iconWrapper}>
        {focused ? (
            <HomeSolid size={24} color="#FFFFFF" />
        ) : (
            <HomeOutline size={24} color="rgba(255, 255, 255, 0.75)" />
        )}
        <View style={[styles.indicator, focused && styles.indicatorActive]} />
    </View>
);

const CommunityTabIcon = ({ focused }: { focused: boolean; color: string; size: number }) => (
    <View style={styles.iconWrapper}>
        {focused ? (
            <CommunitySolid size={24} color="#FFFFFF" />
        ) : (
            <CommunityOutline size={24} color="rgba(255, 255, 255, 0.75)" />
        )}
        <View style={[styles.indicator, focused && styles.indicatorActive]} />
    </View>
);

const LibraryTabIcon = ({ focused }: { focused: boolean; color: string; size: number }) => (
    <View style={styles.iconWrapper}>
        {focused ? (
            <LibrarySolid size={24} color="#FFFFFF" />
        ) : (
            <LibraryOutline size={24} color="rgba(255, 255, 255, 0.75)" />
        )}
        <View style={[styles.indicator, focused && styles.indicatorActive]} />
    </View>
);

const ProfileTabIcon = ({ focused }: { focused: boolean; color: string; size: number }) => (
    <View style={styles.iconWrapper}>
        {focused ? (
            <ProfileSolid size={24} color="#FFFFFF" />
        ) : (
            <ProfileOutline size={24} color="rgba(255, 255, 255, 0.75)" />
        )}
        <View style={[styles.indicator, focused && styles.indicatorActive]} />
    </View>
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
                    elevation: 10,
                    zIndex: 100,
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