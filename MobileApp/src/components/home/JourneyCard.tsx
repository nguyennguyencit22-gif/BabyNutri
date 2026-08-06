import React from "react";
import { Image, ImageSourcePropType, View, Text, StyleSheet } from "react-native";
import { Button } from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';
import styles from '../../styles/home/jouneyCardStyles';

type JourneyCardProps = {
    age: string;
    title: string;
    description: string;
    colorMonths: string;
    image?: ImageSourcePropType;
};

const BLOB_PATH =
    'M42.9,-56.4C54.4,-49.6,61.8,-35.9,64.6,-21.6C67.4,-7.3,65.6,7.6,59.4,20.4C53.2,33.2,42.6,43.9,29.9,51.6C17.2,59.3,2.4,64,-12.5,63.2C-27.4,62.4,-42.4,56.1,-52.6,45.1C-62.8,34.1,-68.2,18.4,-68.5,2.5C-68.8,-13.4,-64,-29.5,-54.1,-41.8C-44.2,-54.1,-29.2,-62.6,-13.5,-65.6C2.2,-68.6,18.6,-66,42.9,-56.4Z';

function JourneyCard(
    { age,
        title,
        description,
        colorMonths,
        image, }: JourneyCardProps
) {
    const [ageNumber, ageUnit] = age.split('\n');

    return (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.ageCircle}>
                    {image ? (
                        <Image
                            source={image}
                            style={styles.ageCircleImage}
                            resizeMode="contain"
                        />
                    ) : (
                        <>
                            <Svg
                                width="100%"
                                height="100%"
                                viewBox="0 0 200 200"
                                style={StyleSheet.absoluteFill}
                            >
                                <Path
                                    d={BLOB_PATH}
                                    transform="translate(100 100)"
                                    fill={colorMonths}
                                    stroke="#5B0010"
                                    strokeWidth={5}
                                />
                            </Svg>

                            <Text style={styles.ageNumberText}>
                                {ageNumber}
                            </Text>
                            <Text style={styles.ageUnitText}>
                                {ageUnit}
                            </Text>
                        </>
                    )}
                </View>

                <Text style={styles.title}>
                    {title}
                </Text>

                <Text style={styles.description}>
                    {description}
                </Text>

                <Button
                    mode="contained"
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                    buttonColor="#FFC62F"
                    textColor="#5B0010"
                >
                    Let&apos;s go!
                </Button>
            </View>
        </View>
    );
}

export default JourneyCard;