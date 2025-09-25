import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("onboarding", "routes/onboarding.tsx"),
  route("sign-in/*", "routes/sign-in.tsx"),
  route("sign-up/*", "routes/sign-up.tsx"),
  route("logout", "routes/logout.tsx"),
  
  // App layout with nested routes
  layout("routes/app.tsx", [
    route("app/v2/dashboard", "routes/dashboard.tsx"),
    route("app/v2/tasks", "routes/tasks.tsx"),
    route("app/v2/classes", "routes/classes.tsx"),
    route("app/v2/grades", "routes/grades.tsx"),
    route("app/v2/files", "routes/files.tsx"),
    route("app/v2/settings", "routes/settings.tsx"),
  ]),
] satisfies RouteConfig;
