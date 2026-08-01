import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import {
    HomeIcon as HomeOutline,
    ChatBubbleLeftRightIcon as CommunityOutline,
    BookOpenIcon as LibraryOutline,
    UserIcon as ProfileOutline
} from 'react-native-heroicons/outline';

import {
    HomeIcon as HomeSolid,
    ChatBubbleLeftRightIcon as CommunitySolid,
    BookOpenIcon as LibrarySolid,
    UserIcon as ProfileSolid
} from 'react-native-heroicons/solid';

import HomeScreen from '../screens/home/HomeScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import LibraryScreen from '../screens/library/LibraryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import type { MainTabParamList } from '../types/navigation/navigationBottomTypes';
import styles from '../styles/navigation/mainTabNavigatorStyles';

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