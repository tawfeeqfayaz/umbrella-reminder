import {
  Sun,
  Cloudy,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  MoonStar,
  CloudDrizzle,
  CloudFog,
} from "lucide-react";

const weatherIcons = {
  sunny: <Sun color="#fbfbfbff" size={20} strokeWidth={2} />,
  cloudy: <Cloudy color="#fbfbfbff" size={20} strokeWidth={2} />,
  partlyCloudy: <CloudSun color="#fbfbfbff" size={20} strokeWidth={2} />,
  rainy: <CloudRain color="#fbfbfbff" size={20} strokeWidth={2} />,
  drizzle: <CloudDrizzle color="#fbfbfbff" size={20} strokeWidth={2} />,
  snowy: <CloudSnow color="#fbfbfbff" size={20} strokeWidth={2} />,
  lightning: <CloudLightning size={20} color="#fbfbfbff" />,
  nightClear: <MoonStar color="#fbfbfbff" size={20} strokeWidth={2} />,
  fog: <CloudFog color="#fbfbfbff" size={20} strokeWidth={2} />,
};

export default weatherIcons;
