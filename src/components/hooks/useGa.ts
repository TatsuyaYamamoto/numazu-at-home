import { initialize, set, pageview, exception } from "react-ga";

// https://github.com/zeit/next.js/blob/master/examples/with-react-ga/utils/analytics.js
const useGa = () => {
  const init = () => {
    const gaTrackingId = process.env.gaTrackingId;

    if (!gaTrackingId) {
      throw new Error(
        "gaTrackingId should not be undefined. see next.config.js"
      );
    }

    initialize(gaTrackingId);
  };

  const logPageView = () => {
    set({ page: window.location.pathname });
    pageview(window.location.pathname);
  };

  const logError = (description: string, fatal = false) => {
    exception({
      description,
      fatal,
    });
  };

  return { init, logPageView, logError };
};

export default useGa;
