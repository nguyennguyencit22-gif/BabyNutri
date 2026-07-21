import React from 'react';
import {
    ScrollView,
    Text,
    View,
} from 'react-native';
import {
    Button,
    Icon,
} from 'react-native-paper';
import { SafeAreaView, } from 'react-native-safe-area-context';

import {
    Avatar,
    IconButton,
    // Surface,
} from 'react-native-paper';
import { HomeColors } from '../../constants/generalHome/homeTheme';
import styles from '../../styles/home/homeStyles'
import { FlatList, Pressable } from "react-native";
import { categories, JOURNEY_ITEMS, WEANING_FEATURES, } from "../../constants/sampleData/homeData";
import JourneyCard from '@/components/home/JourneyCard';

function HomeScreen() {
    const [selectedCategory, setSelectedCategory] = React.useState("Recipes");

    return (
        <SafeAreaView>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>

                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <Avatar.Text
                            size={48}
                            label="B"
                            style={styles.avatar}
                        />

                        <View>
                            <Text style={styles.babyName}>
                                Baby’s Name
                            </Text>

                            <Text style={styles.babyAge}>
                                Create baby profile
                            </Text>
                        </View>
                    </View>

                    <View style={styles.headerActions}>
                        <IconButton
                            icon="bell-outline"
                            size={22}
                            iconColor={HomeColors.primary}
                            containerColor={HomeColors.primarySoft}
                            onPress={() => {
                                console.log(
                                    'Notification pressed',
                                );
                            }}
                        />

                        {/* <Surface
                            elevation={0}
                            style={styles.profileDot}
                        /> */}
                        <View style={styles.profileDot} />
                    </View>
                </View>

                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={categories}
                    keyExtractor={(item) => item}
                    contentContainerStyle={styles.categoryList}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => setSelectedCategory(item)}
                            style={[
                                styles.categoryButton,
                                selectedCategory === item &&
                                styles.categoryButtonActive,
                            ]}>

                            <Text
                                style={[
                                    styles.categoryText,
                                    selectedCategory === item &&
                                    styles.categoryTextActive,
                                ]}>
                                {item}
                            </Text>

                        </Pressable>
                    )}
                />

                <View style={styles.weaningSection}>

                    <Text style={styles.weaningTitle}>
                        Let's get weaning!
                    </Text>

                    <Text style={styles.weaningDescription}>
                        We take the stress out of weaning and put the fun into
                        mealtimes. Explore our weaning hub as we guide you through
                        every stage of your little one's journey.
                    </Text>

                    {WEANING_FEATURES.map(item => (
                        <View
                            key={item}
                            style={styles.featureItem}>
                            <View style={styles.featureIcon}>
                                <Icon
                                    source="emoticon-kiss-outline"
                                    color='#ffe45a'
                                    size={20}
                                />
                            </View>

                            <Text style={styles.featureText}>
                                {item}
                            </Text>

                        </View>
                    ))}

                </View>

                <View style={styles.journeySection}>
                    <Text style={styles.journeyTitle}>
                        Your little one&apos;s weaning journey
                    </Text>

                    <FlatList
                        horizontal
                        data={JOURNEY_ITEMS}
                        keyExtractor={(item) => item.id}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.journeyListContent}

                        renderItem={({ item }) => (
                            <JourneyCard
                                age={item.age}
                                title={item.title}
                                description={item.description}
                                colorMonths={item.colorMonth}
                            />
                        )}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// const styles = StyleSheet.create({
//     scrollContent: {
//         paddingBottom: 120,
//     },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingHorizontal: 20,
//         paddingTop: 22,
//         paddingBottom: 18,
//     },
//     userInfo: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         flex: 1,
//     },
//     avatar: {
//         backgroundColor: HomeColors.primary,
//     },
//     babyName: {
//         marginLeft: 12,
//         color: HomeColors.primary,
//         fontSize: 22,
//         fontWeight: '700',
//     },
//     babyAge: {
//         marginTop: 2,
//         marginLeft: 12,
//         color: HomeColors.textSoft,
//         fontSize: 13,
//     },
//     headerActions: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     profileDot: {
//         width: 36,
//         height: 36,
//         borderRadius: 18,
//         backgroundColor: '#FFC6D0',
//     },
//     placeholderSection: {
//         marginHorizontal: 20,
//         marginTop: 28,
//         borderRadius: 24,
//         padding: 24,
//         backgroundColor: HomeColors.surface,
//     },
//     placeholderTitle: {
//         color: HomeColors.text,
//         fontSize: 22,
//         fontWeight: '700',
//     },
//     placeholderText: {
//         marginTop: 10,
//         color: HomeColors.textSoft,
//         fontSize: 15,
//         lineHeight: 22,
//     },
// });

export default HomeScreen;