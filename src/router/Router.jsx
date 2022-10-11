import { useRoutes } from "react-router-dom";

const { Loading } = require("components");
const { Suspense, lazy } = require("react");

const Loadable = (Component) => (props) => {
  return (
    <Suspense fallback={<Loading />}>
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    {
      path: "login",
      element: <LoginPage />,
      index: true,
    },
  ]);
}

const LoginPage = Loadable(lazy(() => import("pages/LoginPage")));
