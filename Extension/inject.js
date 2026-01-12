(function () {
    const originalPlay = HTMLMediaElement.prototype.play;

    HTMLMediaElement.prototype.play = function () {
        const video = this;

        // Check if the blocker is active and if the user interacted
        const isBlocked = document.documentElement.getAttribute('data-autoplay-blocker-enabled') === 'true';
        const hasInteracted = video.dataset.userInteracted === 'true';
        const isUserActivated = document.documentElement.getAttribute('data-user-activated') === 'true';

        if (isBlocked && !hasInteracted && !isUserActivated) {
            console.log('[Autoplay Blocker] Blocked programmatic play() call:', video);

            // Return a pending promise that never resolves/rejects, 
            // or a rejected promise to satisfy the async nature of play()
            return new Promise((resolve, reject) => {
                // We keep it paused
                video.pause();
                // Some sites expect a Promise back from play()
                // Rejecting might trigger 'Uncaught (in promise)' errors, 
                // but it's the most "honest" way to stop it.
                // Alternatively, we can just resolve and watch it do nothing.
                reject(new DOMException('Autoplay blocked by extension', 'NotAllowedError'));
            }).catch(() => {
                // Silently catch to avoid polluting the console with red errors if possible
            });
        }

        return originalPlay.apply(this, arguments);
    };

    console.log('[Autoplay Blocker] Play prototype overridden.');
})();
