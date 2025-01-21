const reader = await navigator.hid.getDevices();

await navigator.hid.requestDevice({filters: []})
