import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { SafeAreaView, } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

// import {
//     categories,
// } from '../../constants/sampleData/homeData';

import createStyles from '../../styles/home/homeStyles'
import { FlatList, Pressable } from "react-native";
import JourneyCard from '@/components/home/JourneyCard';
import ExpertCard from '../../components/home/ExpertCard';
import RecipeCard from '../../components/home/RecipeCard';
import TopHeaderBar from '@/components/common/TopHeaderBar';
import { useAppTheme } from '../../theme/useAppTheme';
import {
    fetchHomeData,
    HomeData,
} from '../../services/home.service';
import { useFocusEffect } from '@react-navigation/native';
import { getJourneyImage } from '../../constants/home/journeyImages';
import { getRecipeImage } from '../../constants/recipeImages';

const EMPTY_HOME_DATA: HomeData = {
    popularCategories: [],
    popularRecipes: [],
    experts: [],
    journeyItems: [],
    weaningFeatures: [],
};

function HomeScreen({ navigation }: any) {
    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
    const [homeData, setHomeData] = React.useState<HomeData>(EMPTY_HOME_DATA);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const { t } = useTranslation();
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    const loadHomeData = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchHomeData();
            setHomeData(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load home data',
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            loadHomeData();
        }, [loadHomeData])
    );

    const {
        popularCategories,
        popularRecipes,
        experts,
        journeyItems,
        weaningFeatures,
    } = homeData;

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator
                        size="large"
                        color={colors.primary}
                    />
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.weaningDescription}>
                        {error}
                    </Text>
                    <Pressable
                        onPress={loadHomeData}
                        style={styles.expertButton}>
                        <Text style={styles.expertButtonText}>
                            Try again
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>

            <TopHeaderBar />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>

                {/* <FlatList
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
                /> */}

                <View style={styles.weaningSection}>

                    <Text style={styles.weaningTitle}>
                        {t('home.weaningTitle')}
                    </Text>

                    <Text style={styles.weaningDescription}>
                        {t('home.weaningDescription')}
                    </Text>

                    {weaningFeatures.map(item => (
                        <View
                            key={item}
                            style={styles.featureItem}>
                            <View style={styles.featureIcon}>
                                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FF5F70" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <Circle cx="12" cy="12" r="10" />
                                    <Path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
                                </Svg>
                            </View>

                            <Text style={styles.featureText}>
                                {item}
                            </Text>

                        </View>
                    ))}

                </View>

                <View style={styles.journeySection}>
                    <Text style={styles.journeyTitle}>
                        {t('home.journeyTitle')}
                    </Text>

                    <FlatList
                        horizontal
                        data={journeyItems}
                        keyExtractor={(item) => String(item.id)}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.journeyListContent}

                        renderItem={({ item }) => (
                            <JourneyCard
                                age={item.age}
                                title={item.title}
                                description={item.description}
                                colorMonths={item.colorMonth}
                                image={getJourneyImage(item.imageKey)}
                                onPress={item.articleId ? () => navigation.navigate('ArticleDetail', { id: item.articleId }) : undefined}
                            />
                        )}
                    />
                </View>

                <View style={styles.expertSection}>
                    <Text style={styles.expertSectionTitle}>
                        {t('home.expertSectionTitle')}
                    </Text>

                    <FlatList
                        horizontal
                        data={experts}
                        keyExtractor={item => String(item.id)}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.expertList}
                        renderItem={({ item }) => (
                            <ExpertCard
                                name={item.name}
                                role={item.role}
                                image={{ uri: item.image }}
                                onPress={() => navigation.navigate('ExpertDetail', { expertId: item.id, expertName: item.name, image: item.image })}
                            />
                        )}
                    />

                    <Text style={styles.expertDescription}>
                        {t('home.expertDescription')}
                    </Text>

                    <Pressable style={styles.expertButton}>
                        <Text style={styles.expertButtonText}>
                            {t('home.expertButton')}
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.popularSection}>
                    <Text style={styles.popularTitle}>
                        {t('home.popularCategoryTitle')}
                    </Text>

                    <FlatList
                        horizontal
                        data={popularCategories}
                        keyExtractor={item => item}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.popularCategoryList}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() =>
                                    setSelectedCategory(prev => prev === item ? null : item)
                                }
                                style={[
                                    styles.popularChip,
                                    selectedCategory === item &&
                                    styles.popularChipActive,
                                ]}>

                                <Text
                                    style={[
                                        styles.popularChipText,
                                        selectedCategory === item &&
                                        styles.popularChipTextActive,
                                    ]}>
                                    {item}
                                </Text>
                            </Pressable>
                        )}
                    />

                    <FlatList
                        horizontal
                        data={popularRecipes.filter((r) => {
                            if (!selectedCategory) return true;
                            const catLower = selectedCategory.toLowerCase();
                            const nameLower = (r.title || '').toLowerCase();
                            const categoryLower = ((r as any).category || '').toLowerCase();
                            return nameLower.includes(catLower) || categoryLower.includes(catLower);
                        })}
                        keyExtractor={item => String(item.id)}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.recipeList}
                        renderItem={({ item }) => (
                            <RecipeCard
                                title={item.title}
                                time={item.time}
                                image={getRecipeImage(item.id, item.image)}
                                rating={item.rating}
                                ratingCount={item.ratingCount}
                                onPress={() =>
                                    navigation.navigate('RecipeDetail', { recipeId: item.id, id: item.id })
                                }
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