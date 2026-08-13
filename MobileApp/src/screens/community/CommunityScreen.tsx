import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import TopHeaderBar from '../../components/common/TopHeaderBar';
import FAQScreen from '../questions/FAQScreen';
import { useAppTheme } from '../../theme/useAppTheme';

function CommunityScreen({ navigation }: any) {
    const { colors } = useAppTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            <TopHeaderBar />
            <View style={styles.content}>
                <FAQScreen navigation={navigation} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
});

export default CommunityScreen;
