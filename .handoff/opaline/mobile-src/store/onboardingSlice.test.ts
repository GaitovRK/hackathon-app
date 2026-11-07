import { signedIn, signedOut } from "./authSlice";
import { makeStore } from "./index";
import { onboardingFinished, onboardingRequired } from "./onboardingSlice";

jest.mock("@/services/auth/tokenStorage", () => ({ tokenStorage: { load: jest.fn(), save: jest.fn(), clear: jest.fn() } }));

describe("onboardingSlice", () => {
  it("is off by default and on once required", () => {
    const store = makeStore();
    expect(store.getState().onboarding).toEqual({ pending: false, usernameForm: false });
    store.dispatch(onboardingRequired());
    expect(store.getState().onboarding.pending).toBe(true);
    // "Sign in with a username" on the last slide: the login screen opens with the form
    store.dispatch(onboardingFinished());
    expect(store.getState().onboarding).toEqual({ pending: false, usernameForm: true });
  });

  it("ends when the user signs in (or a session is restored), so signing out shows the login screen", () => {
    const store = makeStore();
    store.dispatch(onboardingRequired());
    store.dispatch(signedIn({ username: "anna", token: "tok" }));
    store.dispatch(signedOut());
    expect(store.getState().onboarding).toEqual({ pending: false, usernameForm: false });
  });
});
