"use strict";

const log = require("npmlog");
const fetch = require("npm-registry-fetch");
const ValidationError = require("@lerna/validation-error");

/**
 * Returns:
 *
 *  {
 *    username: "username",
 *    tfa: "unknown" | "disabled" | "auth" | "auth-and-writes"
 *  }
 *
 * If tfaMode is unknown, it means that due to not using the npm registry, we're not able
 * to detect if 2FA is supported or enabled, as alternative registries don't necessarily
 * implement the ~/npm/v1/user endpoint, so we've had to use the ~/whoami endpoint which
 * does not give 2FA information
 */
module.exports = getUser;

function getProfile(opts) {
  log.silly("", "Using profile, 2FA status will be available");

  fetch.json("~/npm/v1/user", opts).then(success, failure);

  function success(result) {
    log.silly("npm profile", "received %j", result);

    if (result.statusCode === 401) {
      throw new ValidationError(
        "ENEEDAUTH",
        "You must be logged in to publish packages. Use `npm login` and try again."
      );
    }

    if (result.statusCode !== 200) {
      throw new ValidationError("EWHOAMI", "Authentication error. Use `npm profile --json` to troubleshoot.");
    }

    const tfaMode = (result.tfa && result.tfa.mode) || "disabled";

    return { username: result.name, tfa: tfaMode };
  }

  function failure(err) {
    // Log the error cleanly to stderr
    log.pause();
    console.error(err.message); // eslint-disable-line no-console
    log.resume();

    throw new ValidationError("EWHOAMI", "Authentication error. Use `npm profile --json` to troubleshoot.");
  }
}

function getWhoAmI(opts) {
  log.silly("", "Using whoami, 2FA status will not be available");

  return fetch.json("-/whoami", opts).then(success, failure);

  function success(result) {
    log.silly("npm whoami", "received %j", result);

    if (!result.username) {
      throw new ValidationError(
        "ENEEDAUTH",
        "You must be logged in to publish packages. Use `npm login` and try again."
      );
    }

    // Because we're using ~/whoami, it's impossible to know the status of 2FA:
    return { username: result.username, tfa: "unknown" };
  }

  function failure(err) {
    // Log the error cleanly to stderr
    log.pause();
    console.error(err.message); // eslint-disable-line no-console
    log.resume();

    log.warn(
      "EWHOAMI",
      "Unable to determine npm username from third-party registry, this command will likely fail soon!"
    );
  }
}

function getUser(opts) {
  log.info("", "Verifying npm credentials");

  if (opts.get("registry") !== "https://registry.npmjs.org/") {
    return getWhoAmI(opts);
  }

  return getProfile(opts);
}
