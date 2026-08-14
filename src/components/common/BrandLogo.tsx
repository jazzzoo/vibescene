import { Image, StyleProp, ImageStyle } from 'react-native';

// leadin_brand_logo.png source: 598 × 129 px
const ASPECT_RATIO = 598 / 129;

interface Props {
  height?: number;
  style?: StyleProp<ImageStyle>;
}

export default function BrandLogo({ height = 40, style }: Props) {
  return (
    <Image
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      source={require('../../../assets/leadin-wordmark.png')}
      style={[{ height, width: height * ASPECT_RATIO }, style]}
      resizeMode="contain"
      accessibilityLabel="LEAD-IN"
    />
  );
}
