import Hero from '../components/Hero';
import AudienceStrip from '../components/AudienceStrip';
import FactsBand from '../components/FactsBand';
import FeatureDeepDive from '../components/FeatureDeepDive';
import OfflineSection from '../components/OfflineSection';
import Modules from '../components/Modules';
import DayOne from '../components/DayOne';
import Editions from '../components/Editions';
import HowItWorks from '../components/HowItWorks';
import HomeFaq from '../components/HomeFaq';
import MainCta from '../components/MainCta';

export default function HomePage() {
  return (
    <>
      <Hero />
      <AudienceStrip />
      <FactsBand />
      <FeatureDeepDive />
      <OfflineSection />
      <Modules />
      <DayOne />
      <Editions />
      <HowItWorks />
      <HomeFaq />
      <MainCta />
    </>
  );
}
