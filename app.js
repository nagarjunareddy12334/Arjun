/* ==========================================================
   APP CONTROLLER & CINEMATIC TIMELINE • ARJUN & AMMU
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const scenes = document.querySelectorAll('.scene-panel');
  const timelineSteps = document.querySelectorAll('.timeline-step');
  const timelineProgressBar = document.getElementById('timeline-progress-bar');
  const cinemaTimeline = document.getElementById('cinema-timeline');
  const cinemaNav = document.getElementById('cinema-nav');

  // Navigation & Controls
  const startJourneyBtn = document.getElementById('start-journey-btn');
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const soundIndicator = document.getElementById('sound-indicator');
  const soundText = document.getElementById('sound-text');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const customizeBtn = document.getElementById('customize-btn');
  const navLetterBtn = document.getElementById('nav-letter-btn');
  const navComicBtn = document.getElementById('nav-comic-btn');
  const navVideoBtn = document.getElementById('nav-video-btn');

  // Scene transition buttons
  const btnToPathway = document.getElementById('btn-to-pathway');
  const btnToMemories = document.getElementById('btn-to-memories');
  const btnToClimax = document.getElementById('btn-to-climax');
  const btnSayYes = document.getElementById('btn-say-yes');
  const btnSayAlways = document.getElementById('btn-say-always');
  const btnReplay = document.getElementById('btn-replay');
  const btnReplayVideos = document.getElementById('btn-replay-videos');
  const btnShareMoment = document.getElementById('btn-share-moment');
  const btnOpenLetterInline = document.getElementById('btn-open-letter-inline');

  // Modals
  const letterModal = document.getElementById('letter-modal');
  const closeLetterModal = document.getElementById('close-letter-modal');
  const personalizeModal = document.getElementById('personalize-modal');
  const closePersonalizeModal = document.getElementById('close-personalize-modal');
  const personalizeForm = document.getElementById('personalize-form');
  const flashOverlay = document.getElementById('flash-overlay');

  // Illustrated Comic Viewer Modal Elements
  const comicModal = document.getElementById('comic-modal');
  const closeComicModal = document.getElementById('close-comic-modal');
  const comicMainImg = document.getElementById('comic-main-img');
  const comicChapterTitle = document.getElementById('comic-chapter-title');
  const comicPageCounter = document.getElementById('comic-page-counter');
  const comicChapterCaption = document.getElementById('comic-chapter-caption');
  const comicPrevBtn = document.getElementById('comic-prev-btn');
  const comicNextBtn = document.getElementById('comic-next-btn');
  const comicThumbBtns = document.querySelectorAll('.comic-thumb-btn');
  const btnReadLetterFromComic = document.getElementById('btn-read-letter-from-comic');
  const btnCloseComicAction = document.getElementById('btn-close-comic-action');
  const comicImgContainer = document.getElementById('comic-img-container');

  // Video Theater Modal Elements
  const videoModal = document.getElementById('video-modal');
  const closeVideoModal = document.getElementById('close-video-modal');
  const btnCloseVideoModalAction = document.getElementById('btn-close-video-modal-action');
  const modalTheaterVideo = document.getElementById('modal-theater-video');
  const modalSwitchV1 = document.getElementById('modal-switch-v1');
  const modalSwitchV2 = document.getElementById('modal-switch-v2');
  const modalVideoTitle = document.getElementById('modal-video-title');
  const modalVideoCaption = document.getElementById('modal-video-caption');

  // Inline Video Player Elements in Chapter 3
  const inlineSceneVideo = document.getElementById('inline-scene-video');
  const switchVideo1 = document.getElementById('switch-video-1');
  const switchVideo2 = document.getElementById('switch-video-2');
  const inlineVideoCaption = document.getElementById('inline-video-caption');
  const btnOpenVideoModalFromCard = document.getElementById('btn-open-video-modal-from-card');

  // State
  let currentSceneIndex = 0; // 0 is Intro, 1..5 are story chapters
  let coupleData = {
    herName: "Ammu",
    hisName: "Arjun",
    specialDate: "September 24, 2026"
  };

  // ----------------------------------------------------------
  // SCENE NAVIGATION
  // ----------------------------------------------------------
  function goToScene(index) {
    if (index < 0 || index >= scenes.length) return;

    // Trigger button tactile sound
    if (window.soundtrack) {
      window.soundtrack.playGentleClick();
    }

    // Pause inline video if moving away from Scene 3
    if (currentSceneIndex === 3 && index !== 3 && inlineSceneVideo) {
      inlineSceneVideo.pause();
    }

    currentSceneIndex = index;

    // Update scenes visibility
    scenes.forEach((scene, i) => {
      if (i === index) {
        scene.classList.add('active');
      } else {
        scene.classList.remove('active');
      }
    });

    // Update soundtrack mood
    if (window.soundtrack) {
      window.soundtrack.setScene(index);
    }

    // Update timeline
    updateTimeline(index);

    // Dynamic UI states
    if (index === 0) {
      cinemaTimeline.classList.add('timeline-hidden');
    } else {
      cinemaTimeline.classList.remove('timeline-hidden');
    }

    // Special scene triggers
    if (index === 4) {
      // The Proposal Climax
      if (window.soundtrack) {
        window.soundtrack.playProposalSwell();
      }
    }
  }

  function updateTimeline(index) {
    const stepNumber = Math.max(1, index);
    const progressPercent = ((stepNumber - 1) / (timelineSteps.length - 1)) * 100;

    if (timelineProgressBar) {
      timelineProgressBar.style.width = `${progressPercent}%`;
    }

    timelineSteps.forEach((step) => {
      const stepVal = parseInt(step.dataset.step, 10);
      step.classList.remove('active', 'completed');
      if (stepVal === stepNumber) {
        step.classList.add('active');
      } else if (stepVal < stepNumber) {
        step.classList.add('completed');
      }
    });
  }

  // ----------------------------------------------------------
  // BUTTON HANDLERS
  // ----------------------------------------------------------

  // Start Journey
  startJourneyBtn.addEventListener('click', () => {
    if (window.soundtrack) {
      window.soundtrack.start();
    }
    soundIndicator.classList.remove('muted');
    soundText.textContent = "Sound: On";
    goToScene(1);
  });

  // Scene transitions
  btnToPathway.addEventListener('click', () => goToScene(2));
  btnToMemories.addEventListener('click', () => goToScene(3));
  btnToClimax.addEventListener('click', () => goToScene(4));

  // Climax YES response!
  function handleYesResponse() {
    // 1. Play celebration fanfare & bells
    if (window.soundtrack) {
      window.soundtrack.playYesCelebration();
    }

    // 2. Trigger particle explosion (Hearts & golden confetti)
    if (window.particleEngine) {
      window.particleEngine.triggerCelebration();
    }

    // 3. Cinematic flash rack-focus transition
    flashOverlay.classList.add('active');
    setTimeout(() => {
      flashOverlay.classList.remove('active');
      goToScene(5); // Go to Forever Ring scene
    }, 700);
  }

  btnSayYes.addEventListener('click', handleYesResponse);
  btnSayAlways.addEventListener('click', handleYesResponse);

  // Replay Journey
  btnReplay.addEventListener('click', () => {
    goToScene(1);
  });

  if (btnReplayVideos) {
    btnReplayVideos.addEventListener('click', () => {
      openVideoModal(0);
    });
  }

  // Share / Love Letter Keepsake
  btnShareMoment.addEventListener('click', () => {
    openModal(letterModal);
  });

  // Timeline Step Clicks
  timelineSteps.forEach(step => {
    step.addEventListener('click', () => {
      const stepIdx = parseInt(step.dataset.step, 10);
      goToScene(stepIdx);
    });
  });

  // ----------------------------------------------------------
  // VIDEO REEL CONTROLLER & DUCKING
  // ----------------------------------------------------------
  const videoReels = [
    {
      src: "assets/ammu_video_1.mp4",
      title: "Our Sweetest Moments",
      caption: "“The sound of your voice and your contagious laugh are my favorite melody, Ammu.”"
    },
    {
      src: "assets/ammu_video_2.mp4",
      title: "Smiles, Laughter & Us",
      caption: "“Every smile you give me lights up my entire world. Forever grateful for you.”"
    }
  ];

  // Inline Video Switching
  function switchInlineVideo(idx) {
    if (!inlineSceneVideo) return;
    const v = videoReels[idx];
    inlineSceneVideo.src = v.src;
    inlineSceneVideo.load();
    if (inlineVideoCaption) {
      inlineVideoCaption.textContent = v.caption;
    }
    if (idx === 0) {
      switchVideo1.classList.add('active');
      switchVideo2.classList.remove('active');
    } else {
      switchVideo2.classList.add('active');
      switchVideo1.classList.remove('active');
    }
  }

  if (switchVideo1) {
    switchVideo1.addEventListener('click', () => switchInlineVideo(0));
  }
  if (switchVideo2) {
    switchVideo2.addEventListener('click', () => switchInlineVideo(1));
  }

  // Video Theater Modal Switching
  function switchModalTheaterVideo(idx) {
    if (!modalTheaterVideo) return;
    const v = videoReels[idx];
    modalTheaterVideo.src = v.src;
    modalTheaterVideo.load();
    if (modalVideoTitle) modalVideoTitle.textContent = v.title;
    if (modalVideoCaption) modalVideoCaption.textContent = v.caption;

    if (idx === 0) {
      modalSwitchV1.classList.add('active');
      modalSwitchV2.classList.remove('active');
    } else {
      modalSwitchV2.classList.add('active');
      modalSwitchV1.classList.remove('active');
    }
  }

  if (modalSwitchV1) {
    modalSwitchV1.addEventListener('click', () => switchModalTheaterVideo(0));
  }
  if (modalSwitchV2) {
    modalSwitchV2.addEventListener('click', () => switchModalTheaterVideo(1));
  }

  function openVideoModal(idx = 0) {
    switchModalTheaterVideo(idx);
    openModal(videoModal);
    if (inlineSceneVideo) inlineSceneVideo.pause();
    if (modalTheaterVideo) {
      modalTheaterVideo.play().catch(e => console.log('Auto-play note:', e));
    }
  }

  if (navVideoBtn) {
    navVideoBtn.addEventListener('click', () => openVideoModal(0));
  }
  if (btnOpenVideoModalFromCard) {
    btnOpenVideoModalFromCard.addEventListener('click', () => openVideoModal(0));
  }
  if (closeVideoModal) {
    closeVideoModal.addEventListener('click', () => {
      if (modalTheaterVideo) modalTheaterVideo.pause();
      closeModal(videoModal);
    });
  }
  if (btnCloseVideoModalAction) {
    btnCloseVideoModalAction.addEventListener('click', () => {
      if (modalTheaterVideo) modalTheaterVideo.pause();
      closeModal(videoModal);
    });
  }

  // Audio ducking for videos
  const videosList = [inlineSceneVideo, modalTheaterVideo];
  videosList.forEach(vid => {
    if (vid) {
      vid.addEventListener('play', () => {
        if (window.soundtrack) {
          window.soundtrack.duck();
        }
      });
      vid.addEventListener('pause', () => {
        if (window.soundtrack) {
          window.soundtrack.unduck();
        }
      });
      vid.addEventListener('ended', () => {
        if (window.soundtrack) {
          window.soundtrack.unduck();
        }
      });
    }
  });

  // ----------------------------------------------------------
  // ILLUSTRATED COMIC CHAPTERS DATA & VIEWER
  // ----------------------------------------------------------
  const comicChapters = [
    {
      title: "The Snap & Seven Days",
      counter: "CHAPTER 1 OF 5",
      caption: "“A random request. One picture. One smile. And somehow... my heart chose her.”",
      src: "assets/comic5_snap_seven_days.jpg"
    },
    {
      title: "Sent by God • Krishna's Answer",
      counter: "CHAPTER 2 OF 5",
      caption: "“You didn't let me fall in love again... You gave me someone worth falling for. And this time, I don't want to get back up.”",
      src: "assets/comic3_krishna_prayer.jpg"
    },
    {
      title: "Jasmine & The Temple",
      counter: "CHAPTER 3 OF 5",
      caption: "“Weaving fresh fragrant jasmine into your hair... Your happiness is weightless, Ammu.”",
      src: "assets/comic2_temple_jasmine.jpg"
    },
    {
      title: "Everyday Magic & Care",
      counter: "CHAPTER 4 OF 5",
      caption: "“Today started with me worrying about you... and ended with you smiling. Some days are special simply because you were happy.”",
      src: "assets/comic4_daily_chats.jpg"
    },
    {
      title: "The Flower Garden & The Dream",
      counter: "CHAPTER 5 OF 5",
      caption: "“Every time I see her, it feels like she is standing in the middle of a beautiful flower garden... Walking together into the ocean sunset.”",
      src: "assets/comic1_quiet_evening_dream.jpg"
    }
  ];

  let currentComicIndex = 0;

  function setComicChapter(idx) {
    if (idx < 0) idx = comicChapters.length - 1;
    if (idx >= comicChapters.length) idx = 0;
    currentComicIndex = idx;

    const ch = comicChapters[idx];
    if (comicMainImg) comicMainImg.src = ch.src;
    if (comicChapterTitle) comicChapterTitle.textContent = ch.title;
    if (comicPageCounter) comicPageCounter.textContent = ch.counter;
    if (comicChapterCaption) comicChapterCaption.textContent = ch.caption;

    if (comicImgContainer) comicImgContainer.scrollTop = 0;

    comicThumbBtns.forEach((btn, i) => {
      if (i === idx) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (window.soundtrack) {
      window.soundtrack.playGentleClick();
    }
  }

  function openComicViewer(idx = 0) {
    setComicChapter(idx);
    openModal(comicModal);
  }

  if (comicPrevBtn) {
    comicPrevBtn.addEventListener('click', () => setComicChapter(currentComicIndex - 1));
  }
  if (comicNextBtn) {
    comicNextBtn.addEventListener('click', () => setComicChapter(currentComicIndex + 1));
  }

  comicThumbBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.comicIdx, 10);
      setComicChapter(idx);
    });
  });

  if (closeComicModal) {
    closeComicModal.addEventListener('click', () => closeModal(comicModal));
  }
  if (btnCloseComicAction) {
    btnCloseComicAction.addEventListener('click', () => closeModal(comicModal));
  }
  if (btnReadLetterFromComic) {
    btnReadLetterFromComic.addEventListener('click', () => {
      closeModal(comicModal);
      openModal(letterModal);
    });
  }

  if (navComicBtn) {
    navComicBtn.addEventListener('click', () => {
      openComicViewer(0);
    });
  }

  document.querySelectorAll('.comic-preview-frame, .btn-open-comic').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.comicIdx || "0", 10);
      openComicViewer(idx);
    });
  });

  // ----------------------------------------------------------
  // MEMORY CARD TABS (SCENE 3)
  // ----------------------------------------------------------
  const miniTags = document.querySelectorAll('.mini-tag');
  const memoryStories = {
    'song': document.getElementById('memory-story-song'),
    'videos': document.getElementById('memory-story-videos'),
    '1': document.getElementById('memory-story-1'),
    '2': document.getElementById('memory-story-2'),
    '3': document.getElementById('memory-story-3'),
    '4': document.getElementById('memory-story-4'),
    '5': document.getElementById('memory-story-5'),
    '6': document.getElementById('memory-story-6')
  };

  miniTags.forEach(tag => {
    tag.addEventListener('click', (e) => {
      const target = e.currentTarget.dataset.target;

      Object.keys(memoryStories).forEach(k => {
        if (memoryStories[k]) {
          if (k === target) {
            memoryStories[k].classList.add('active');
          } else {
            memoryStories[k].classList.remove('active');
          }
        }
      });

      miniTags.forEach(t => {
        if (t.dataset.target === target) {
          t.classList.add('active');
        } else {
          t.classList.remove('active');
        }
      });

      if (window.soundtrack) {
        window.soundtrack.playGentleClick();
      }
    });
  });

  // ----------------------------------------------------------
  // SOUNDTRACK SELECTOR CONTROLLER
  // ----------------------------------------------------------
  const trackPillBtns = document.querySelectorAll('.track-pill-btn');
  const btnToggleArjunSong = document.getElementById('btn-toggle-arjun-song');
  const arjunSongPlayIcon = document.getElementById('arjun-song-play-icon');
  const songVinylDisc = document.getElementById('song-vinyl-disc');
  const btnSwitchToPianoScore = document.getElementById('btn-switch-to-piano-score');

  function updateTrackSelectorUI(selectedTrack) {
    trackPillBtns.forEach(btn => {
      if (btn.dataset.track === selectedTrack) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (window.soundtrack) {
      if (selectedTrack === 'arjun_song' || selectedTrack === 'ammu_short') {
        soundText.textContent = "Song: Arjun";
      } else if (selectedTrack === 'romantic_piano') {
        soundText.textContent = "Piano: Ballad";
      } else if (selectedTrack === 'voice_note') {
        soundText.textContent = "Love Note";
      }
    }
  }

  trackPillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const trackKey = btn.dataset.track;
      if (window.soundtrack) {
        window.soundtrack.setTrack(trackKey);
      }
      updateTrackSelectorUI(trackKey);
    });
  });

  // Dedicated song card play/pause toggle in Scene 3
  if (btnToggleArjunSong) {
    btnToggleArjunSong.addEventListener('click', () => {
      if (!window.soundtrack) return;
      if (window.soundtrack.currentTrack !== 'arjun_song') {
        window.soundtrack.setTrack('arjun_song');
        updateTrackSelectorUI('arjun_song');
        if (arjunSongPlayIcon) arjunSongPlayIcon.textContent = '❚❚';
        if (songVinylDisc) songVinylDisc.classList.remove('paused');
      } else {
        if (window.soundtrack.audioElement && !window.soundtrack.audioElement.paused) {
          window.soundtrack.audioElement.pause();
          if (arjunSongPlayIcon) arjunSongPlayIcon.textContent = '▶';
          if (songVinylDisc) songVinylDisc.classList.add('paused');
        } else {
          window.soundtrack.playSelectedAudioTrack();
          if (arjunSongPlayIcon) arjunSongPlayIcon.textContent = '❚❚';
          if (songVinylDisc) songVinylDisc.classList.remove('paused');
        }
      }
    });
  }

  if (btnSwitchToPianoScore) {
    btnSwitchToPianoScore.addEventListener('click', () => {
      if (window.soundtrack) {
        window.soundtrack.setTrack('romantic_piano');
        updateTrackSelectorUI('romantic_piano');
      }
      if (arjunSongPlayIcon) arjunSongPlayIcon.textContent = '▶';
      if (songVinylDisc) songVinylDisc.classList.add('paused');
    });
  }

  // Love letter buttons
  if (navLetterBtn) {
    navLetterBtn.addEventListener('click', () => {
      openModal(letterModal);
      if (window.soundtrack) window.soundtrack.playGentleClick();
    });
  }

  if (btnOpenLetterInline) {
    btnOpenLetterInline.addEventListener('click', () => {
      openModal(letterModal);
      if (window.soundtrack) window.soundtrack.playGentleClick();
    });
  }

  // ----------------------------------------------------------
  // AUDIO TOGGLE
  // ----------------------------------------------------------
  audioToggleBtn.addEventListener('click', () => {
    if (!window.soundtrack.isPlaying) {
      window.soundtrack.start();
      soundIndicator.classList.remove('muted');
      soundText.textContent = "Sound: On";
      return;
    }

    const isMuted = window.soundtrack.toggleMute();
    if (isMuted) {
      soundIndicator.classList.add('muted');
      soundText.textContent = "Sound: Off";
    } else {
      soundIndicator.classList.remove('muted');
      soundText.textContent = "Sound: On";
    }
  });

  // ----------------------------------------------------------
  // FULLSCREEN TOGGLE
  // ----------------------------------------------------------
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Fullscreen error: ${err.message}`);
      });
      document.body.classList.add('cinema-fullscreen');
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      document.body.classList.remove('cinema-fullscreen');
    }
  });

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      document.body.classList.remove('cinema-fullscreen');
    }
  });

  // ----------------------------------------------------------
  // MODALS MANAGEMENT
  // ----------------------------------------------------------
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
  }

  closeLetterModal.addEventListener('click', () => closeModal(letterModal));
  closePersonalizeModal.addEventListener('click', () => closeModal(personalizeModal));

  customizeBtn.addEventListener('click', () => openModal(personalizeModal));

  [letterModal, personalizeModal, comicModal, videoModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          if (modal === videoModal && modalTheaterVideo) {
            modalTheaterVideo.pause();
          }
          closeModal(modal);
        }
      });
    }
  });

  // Personalization Form submission
  personalizeForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const herName = document.getElementById('input-her-name').value.trim() || "Ammu";
    const hisName = document.getElementById('input-his-name').value.trim() || "Arjun";
    const specialDate = document.getElementById('input-special-date').value.trim() || "September 24, 2026";
    const audioFileInput = document.getElementById('input-audio-file');

    coupleData.herName = herName;
    coupleData.hisName = hisName;
    coupleData.specialDate = specialDate;

    // Apply names across DOM
    const navCouple = document.getElementById('nav-couple-names');
    if (navCouple) navCouple.textContent = `${hisName} & ${herName}`;

    const proposalRecipient = document.getElementById('proposal-recipient-name');
    if (proposalRecipient) proposalRecipient.textContent = `My Dearest ${herName},`;

    const displayCoupleNames = document.getElementById('display-couple-names');
    if (displayCoupleNames) displayCoupleNames.textContent = `${hisName} & ${herName} • Bound For Eternity`;

    const displayDate = document.getElementById('display-date');
    if (displayDate) displayDate.textContent = specialDate;

    const letterSender = document.getElementById('letter-sender-name');
    if (letterSender) letterSender.textContent = hisName;

    // Custom music file
    if (audioFileInput.files && audioFileInput.files[0]) {
      window.soundtrack.setCustomAudio(audioFileInput.files[0]);
    }

    closeModal(personalizeModal);
  });

  // Love letter print/save keepsake certificate
  document.getElementById('btn-print-letter').addEventListener('click', () => {
    window.print();
  });

  document.getElementById('btn-edit-letter').addEventListener('click', () => {
    closeModal(letterModal);
    openModal(personalizeModal);
  });

  // ----------------------------------------------------------
  // KEYBOARD NAVIGATION
  // ----------------------------------------------------------
  document.addEventListener('keydown', (e) => {
    if (comicModal && comicModal.classList.contains('active')) {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setComicChapter(currentComicIndex + 1);
        return;
      } else if (e.key === 'ArrowLeft') {
        setComicChapter(currentComicIndex - 1);
        return;
      } else if (e.key === 'Escape') {
        closeModal(comicModal);
        return;
      }
    }

    if (videoModal && videoModal.classList.contains('active')) {
      if (e.key === 'Escape') {
        if (modalTheaterVideo) modalTheaterVideo.pause();
        closeModal(videoModal);
        return;
      }
    }

    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      if (currentSceneIndex === 0) {
        startJourneyBtn.click();
      } else if (currentSceneIndex === 4) {
        btnSayYes.click();
      } else if (currentSceneIndex < 5) {
        goToScene(currentSceneIndex + 1);
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      if (currentSceneIndex > 1) {
        goToScene(currentSceneIndex - 1);
      }
    } else if (e.key.toLowerCase() === 'm') {
      audioToggleBtn.click();
    } else if (e.key.toLowerCase() === 'f') {
      fullscreenBtn.click();
    } else if (e.key === 'Escape') {
      closeModal(letterModal);
      closeModal(personalizeModal);
      closeModal(comicModal);
      closeModal(videoModal);
    }
  });
});
