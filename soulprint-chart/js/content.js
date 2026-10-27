/* All the words shown on the results page.
   To add Burmese: type it between the quote marks of the  my: ""  line under any item.
   The page shows it automatically under the English text. Leave it empty to hide the space. */
(function (root, factory) {
  var content = factory();
  if (typeof module === 'object' && module.exports) module.exports = content;
  else { root.Soulprint = root.Soulprint || {}; root.Soulprint.content = content; }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var TYPES = {
    'generator': {
      name: 'Generator',
      en: 'Generators carry steady, life-giving energy that wants to be spent on work and people you truly love. You feel most alive when you are doing something that lights you up, and drained when you push through things you do not care about. Your body gives you clear yes and no answers, and learning to trust them is your main practice.',
      my: ''
    },
    'manifesting-generator': {
      name: 'Manifesting Generator',
      en: 'You are a quick, multi-passionate mix of builder and starter. You may move between interests fast, skip steps other people need, and find your own shortcuts. That is not being scattered. It is how your energy finds the most direct road. Check in with your body about what feels right, then move.',
      my: ''
    },
    'projector': {
      name: 'Projector',
      en: 'Projectors are natural guides who see people and systems very clearly. Your energy is not made to run all day, so rest and quiet time are part of your work, not a reward for it. When your gift is truly recognised, your guidance lands and you feel seen.',
      my: ''
    },
    'manifestor': {
      name: 'Manifestor',
      en: 'Manifestors are here to begin things and set new movements in motion. You have strong, private energy, and people may feel it before you say a word. You do best when you have space to follow your impulses and let the people around you know what is coming.',
      my: ''
    },
    'reflector': {
      name: 'Reflector',
      en: 'Reflectors are rare. You take in the energy of the people and places around you and mirror it back, like a clear lake. Because you are so sensitive to your surroundings, the company and places you choose matter a great deal. Your best clarity arrives slowly, over time.',
      my: ''
    }
  };

  var STRATEGIES = {
    'respond': {
      name: 'Wait to respond',
      en: 'Instead of forcing a plan, let life show you something first: a question, an offer, a feeling in your body. Then notice whether you feel pulled toward it or pulled away. Responding is not being passive. It is choosing from what is really in front of you, so your energy goes where it comes back to you.',
      my: ''
    },
    'respond-inform': {
      name: 'Respond, then inform',
      en: 'Like a Generator, notice what truly lights you up before you commit. Once you feel your yes, let the people around you know where you are heading, so they can keep up with your pace. Telling them first smooths your path and saves you from unnecessary friction.',
      my: ''
    },
    'invitation': {
      name: 'Wait for the invitation',
      en: 'Invitations into the big areas of life, such as work, love and home, help your guidance be received instead of resisted. While you wait, you are not idle. You are building your skills, resting, and staying visible to people who value what you offer. The right invitation feels respectful and clear.',
      my: ''
    },
    'inform': {
      name: 'Inform before you act',
      en: 'You do not need permission, but letting key people know what you are about to do clears the road ahead of you. A short message like "I am going to..." can turn resistance into support. You will likely feel calmer and more at peace when you do this.',
      my: ''
    },
    'lunar-cycle': {
      name: 'Wait through a lunar cycle',
      en: 'Big decisions can feel different from day to day because you reflect what is around you. Give important choices about 28 days, one full Moon cycle, and talk them through with someone you trust. By the end you will see what stays true no matter the day.',
      my: ''
    }
  };

  var AUTHORITIES = {
    'emotional': {
      name: 'Emotional Authority',
      en: 'Your clarity comes in waves. You can feel high, low, certain and unsure in the same day, and no single moment tells the whole story. Give big decisions time, sleep on them, and notice what stays steady once the wave settles. There is no need to rush.',
      my: ''
    },
    'sacral': {
      name: 'Sacral Authority',
      en: 'Your decisions are made in the body, in the moment. A gut sound like "uh-huh" or "uh-uh", or a feeling of being drawn in or pulled back, often answers before your mind catches up. Simple yes-or-no questions work best, so ask them one at a time.',
      my: ''
    },
    'splenic': {
      name: 'Splenic Authority',
      en: 'Your guidance is quiet, instant, and speaks only once. It can show up as a hunch, a sudden "not this", or a feeling of calm. It is easy to talk yourself out of it, so practise noticing it and trusting it, especially around safety and health.',
      my: ''
    },
    'ego': {
      name: 'Ego (Heart) Authority',
      en: 'Your power comes from your will and your heart. Ask yourself what you truly want and what you can honestly promise. Say it out loud to someone who listens well and notice how it feels to hear yourself. If a promise would cost you too much, it is fine to say no.',
      my: ''
    },
    'self-projected': {
      name: 'Self-Projected Authority',
      en: 'You find your truth by speaking it. Talk your choices through with someone you trust and listen to the sound of your own voice: what feels like you, and what does not. You are not asking for advice. You are hearing yourself out loud.',
      my: ''
    },
    'mental': {
      name: 'Outer Authority (Sounding Board)',
      en: 'You do not have an inner pull to lean on, so clarity grows through conversation. Talk with a few people you trust, in places that feel safe and familiar, and notice what feels true as you hear yourself speak. Choose your sounding boards well, then decide for yourself.',
      my: ''
    },
    'lunar': {
      name: 'Lunar Authority',
      en: 'Your clarity builds over a full Moon cycle. Notice how an idea feels across different days, places and company, and talk it over with people you trust. After about 28 days, what stays steady is likely true for you.',
      my: ''
    }
  };

  var PROFILE_LINES = {
    1: 'Investigator', 2: 'Natural', 3: 'Experimenter', 4: 'Networker', 5: 'Problem-Solver', 6: 'Role Model'
  };

  var PROFILES = {
    '1/3': { en: 'You need solid ground under your feet, so you research, ask questions and dig deeper before you feel safe. You also learn by trying things, and mistakes are how you find what works. Over time, this makes you the one who knows what really holds up.', my: '' },
    '1/4': { en: 'You build deep knowledge first, then share it with the people close to you. Your friends and community are where your opportunities come from. You are most at ease when you know your subject and trust your circle.', my: '' },
    '2/4': { en: 'You have natural gifts that you may not notice because they come so easily. You need quiet time alone to recharge, and the people around you often call you out to share what you do best. Your close circle brings your biggest opportunities.', my: '' },
    '2/5': { en: 'Your natural talents shine when someone recognises them and calls you forward. Others may place big hopes on you and expect you to fix things. Protect your quiet time, and step out when the request fits what you truly can offer.', my: '' },
    '3/5': { en: 'You learn by doing, and your trial-and-error path gives you practical wisdom other people can use. Friends and strangers may look to you for solutions, so share what has worked in real life. Every "failed" try is simply useful information for next time.', my: '' },
    '3/6': { en: 'Your early years are often full of experiments and changes. Later in life you tend to settle into a calmer, wiser view built from experience. In time you become an example of what is possible, simply by living it honestly.', my: '' },
    '4/6': { en: 'Your life flows through relationships, and your trusted circle is your foundation. You grow by learning, stepping back to reflect, and then living as a steady example. People feel your warmth and sense your depth.', my: '' },
    '4/1': { en: 'You have a steady, settled way of seeing life, backed by solid knowledge. Your circle of friends and family shapes your path, and they trust your sense of what is real. You are at your best when you stay true to your own foundation.', my: '' },
    '5/1': { en: 'You see practical answers, and your careful research makes you reliable. Others may place hopes on you, so it helps to be clear about what you can and cannot do. Solid preparation earns you lasting trust.', my: '' },
    '5/2': { en: 'You have a natural gift for solving problems, and you may need to be gently called out of your quiet space to use it. Others can see you as a rescuer, so be clear about your own limits. Rest first, then step out when it feels right.', my: '' },
    '6/2': { en: 'You see life in phases: experimenting, stepping back, and then leading by example. Your natural gifts become clearer as you grow older, and you need quiet time to reflect. People look up to your calm presence.', my: '' },
    '6/3': { en: 'Your path has been full of experiments and lessons, and each one has shaped your wisdom. You are here to live honestly and learn by doing. With time, your own stories become guidance for others.', my: '' }
  };

  var DEFINITIONS = {
    'none': { name: 'No definition', en: 'None of your centers are consistently defined, so you take in and reflect the energy around you.', my: '' },
    'single': { name: 'Single Definition', en: 'Your defined centers are all joined together, so you tend to feel self-contained and can decide from one steady source.', my: '' },
    'split': { name: 'Split Definition', en: 'Your defined energy forms two separate groups. You may feel drawn to people or places that help bridge the gap between them.', my: '' },
    'triple': { name: 'Triple Split Definition', en: 'Your defined energy forms three separate groups. You often do best with a variety of people and enough time to take things in.', my: '' },
    'quadruple': { name: 'Quadruple Split Definition', en: 'Your defined energy forms four separate groups. You tend to need time and space to sort things out in your own way.', my: '' }
  };

  var CROSS_ANGLES = {
    'right': { name: 'Right Angle Cross', en: 'A personal path: your purpose unfolds through your own experience and the people you meet.', my: '' },
    'juxtaposition': { name: 'Juxtaposition Cross', en: 'A fixed path: your purpose is carried by your own steady and unique point of view.', my: '' },
    'left': { name: 'Left Angle Cross', en: 'A shared path: your purpose unfolds through other people and what you build together.', my: '' }
  };

  // ---- Not-Self theme and Signature, by type ----
  var NOT_SELF = {
    'generator': { name: 'Frustration', en: 'Frustration is a sign your energy is going somewhere that does not light you up. When it appears, treat it as a kind message to pause and check what you are really responding to.', my: '' },
    'manifesting-generator': { name: 'Frustration and Anger', en: 'Frustration, and sometimes a flash of anger, can appear when you push a plan or feel held back. Take it as a signal to slow down, feel what you actually want, and respond instead of forcing.', my: '' },
    'projector': { name: 'Bitterness', en: 'Bitterness can build when your guidance goes unseen, or when you push to be heard before you are asked. Let it remind you that rest and waiting for recognition are not wasted time.', my: '' },
    'manifestor': { name: 'Anger', en: 'Anger often rises when others block your path, or when you have not shared what you are about to do. It is a cue to inform the people around you and to protect your freedom to act.', my: '' },
    'reflector': { name: 'Disappointment', en: 'Disappointment can come when you absorb the energy of the wrong people or places. Let it guide you toward spaces and company that feel genuinely good.', my: '' }
  };
  var SIGNATURE = {
    'generator': { name: 'Satisfaction', en: 'Satisfaction is the quiet yes you feel when your energy is going into something that is truly yours. Notice it as your sign that you are on track.', my: '' },
    'manifesting-generator': { name: 'Satisfaction and Peace', en: 'Satisfaction, with a sense of inner peace, is your sign that you are following your response and moving at your own speed.', my: '' },
    'projector': { name: 'Success', en: 'Success is feeling recognised and invited for what you offer. It is your sign that your guidance is landing in the right place.', my: '' },
    'manifestor': { name: 'Peace', en: 'Peace is the calm that settles when you act on your impulses and keep the people around you informed. It is your sign that you are in flow.', my: '' },
    'reflector': { name: 'Surprise', en: 'Surprise is the delight of staying open to the world and seeing what unfolds. It is your sign that you are in the right surroundings.', my: '' }
  };

  // ---- The four arrows (Variables) ----
  // Colour names are in order for colours 1 to 6. The arrow points left for tones 1-3 and right for tones 4-6.
  // "sides" and "subtypes" are left empty on purpose: fill them in from your own training material and they will
  // appear on the page. Example:  sides: { left: 'Active', right: 'Passive' }
  //   subtypes: [ { left: 'Consecutive', right: 'Alternating' }, ... six entries, one per colour ... ]
  function blankSubtypes() { return [{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }]; }
  var VARIABLES = {
    digestion: {
      title: 'Digestion', where: 'Top-left arrow', blurb: 'How your body is happiest taking in food and information.',
      colors: ['Appetite', 'Taste', 'Thirst', 'Touch', 'Sound', 'Light'], sides: { left: '', right: '' }, subtypes: blankSubtypes(), my: ''
    },
    environment: {
      title: 'Environment', where: 'Bottom-left arrow', blurb: 'The kind of surroundings where you feel most at ease.',
      colors: ['Caves', 'Markets', 'Kitchens', 'Mountains', 'Valleys', 'Shores'], sides: { left: '', right: '' }, subtypes: blankSubtypes(), my: ''
    },
    motivation: {
      title: 'Motivation', where: 'Top-right arrow', blurb: 'What quietly drives your mind.',
      colors: ['Fear', 'Hope', 'Desire', 'Need', 'Guilt', 'Innocence'], sides: { left: '', right: '' }, subtypes: blankSubtypes(), my: ''
    },
    perspective: {
      title: 'Perspective', where: 'Bottom-right arrow', blurb: 'How you naturally look at and sort what you notice.',
      colors: ['Survival', 'Possibility', 'Power', 'Wanting', 'Probability', 'Personal'], sides: { left: '', right: '' }, subtypes: blankSubtypes(), my: ''
    }
  };

  // ---- Incarnation cross names ----
  // A cross is named by the Personality Sun gate plus its angle (Right Angle, Juxtaposition or Left Angle).
  var RAC_FAMILIES = [
    ['the Sphinx', [13, 2, 7, 1]], ['Explanation', [49, 23, 4, 43]], ['Contagion', [30, 8, 29, 14]], ['the Sleeping Phoenix', [55, 20, 59, 34]],
    ['Planning', [37, 16, 40, 9]], ['Consciousness', [63, 35, 64, 5]], ['Rulership', [22, 45, 47, 26]], ['the Eden', [36, 12, 6, 11]],
    ['the Vessel of Love', [25, 15, 46, 10]], ['Service', [17, 52, 18, 58]], ['Tension', [21, 39, 48, 38]], ['Penetration', [51, 53, 57, 54]],
    ['the Maya', [42, 62, 32, 61]], ['Laws', [3, 56, 50, 60]], ['the Unexpected', [27, 31, 28, 41]], ['the Four Ways', [24, 33, 44, 19]]
  ];
  var LAC_FAMILIES = [
    ['Masks', [13, 7]], ['Revolution', [49, 4]], ['Industry', [30, 29]], ['Spirit', [55, 59]], ['Migration', [37, 40]], ['Dominion', [63, 64]],
    ['Informing', [22, 47]], ['the Plane', [36, 6]], ['Healing', [25, 46]], ['Upheaval', [17, 18]], ['Endeavor', [21, 48]], ['the Clarion', [51, 57]],
    ['Limitation', [42, 32]], ['Wishes', [3, 50]], ['Alignment', [27, 28]], ['Incarnation', [24, 44]], ['Defiance', [2, 1]], ['Dedication', [23, 43]],
    ['Uncertainty', [8, 14]], ['Duality', [20, 34]], ['Identification', [16, 9]], ['Separation', [35, 5]], ['Confrontation', [45, 26]], ['Education', [12, 11]],
    ['Prevention', [15, 10]], ['Demands', [52, 58]], ['Individualism', [39, 38]], ['Cycles', [53, 54]], ['Obscuration', [62, 61]], ['Distraction', [56, 60]],
    ['the Alpha', [31, 41]], ['Refinement', [33, 19]]
  ];
  var JC_NAMES = {
    13: 'Listening', 49: 'Principles', 30: 'Fates', 55: 'Moods', 37: 'Bargains', 63: 'Doubts', 22: 'Grace', 36: 'Crisis', 25: 'Innocence', 17: 'Opinions',
    21: 'Control', 51: 'Shock', 42: 'Completion', 3: 'Mutation', 27: 'Caring', 24: 'Rationalization', 2: 'the Driver', 23: 'Assimilation', 8: 'Contribution',
    20: 'the Now', 16: 'Experimentation', 35: 'Experience', 45: 'Possession', 12: 'Articulation', 15: 'Extremes', 52: 'Stillness', 39: 'Provocation',
    53: 'Beginnings', 62: 'Detail', 56: 'Stimulation', 31: 'Influence', 33: 'Retreat', 7: 'Interaction', 4: 'Formulation', 29: 'Commitment', 59: 'Strategy',
    40: 'Denial', 64: 'Confusion', 47: 'Oppression', 6: 'Conflict', 46: 'Serendipity', 18: 'Correction', 48: 'Depth', 57: 'Intuition', 32: 'Conservation',
    50: 'Values', 28: 'Risks', 44: 'Alertness', 1: 'Self-Expression', 43: 'Insight', 14: 'Empowering', 34: 'Power', 9: 'Focus', 5: 'Habits', 26: 'the Trickster',
    11: 'Ideas', 10: 'Behavior', 58: 'Vitality', 38: 'Opposition', 54: 'Ambition', 61: 'Thinking', 60: 'Limitation', 41: 'Fantasy', 19: 'Need'
  };
  var CROSS_NAMES = { right: {}, left: {}, juxtaposition: JC_NAMES };
  RAC_FAMILIES.forEach(function (f) { f[1].forEach(function (g) { CROSS_NAMES.right[g] = f[0]; }); });
  LAC_FAMILIES.forEach(function (f) { f[1].forEach(function (g) { CROSS_NAMES.left[g] = f[0]; }); });
  var ANGLE_LABELS = { right: 'Right Angle Cross', juxtaposition: 'Juxtaposition Cross', left: 'Left Angle Cross' };

  // e.g. crossTitle('left', 64) -> "Left Angle Cross of Dominion"
  function crossTitle(angle, personalitySunGate) {
    var name = CROSS_NAMES[angle] && CROSS_NAMES[angle][personalitySunGate];
    return ANGLE_LABELS[angle] + (name ? ' of ' + name : '');
  }

  return {
    TYPES: TYPES, STRATEGIES: STRATEGIES, AUTHORITIES: AUTHORITIES, PROFILE_LINES: PROFILE_LINES,
    PROFILES: PROFILES, DEFINITIONS: DEFINITIONS, CROSS_ANGLES: CROSS_ANGLES, CROSS_NAMES: CROSS_NAMES,
    NOT_SELF: NOT_SELF, SIGNATURE: SIGNATURE, VARIABLES: VARIABLES, RAC_FAMILIES: RAC_FAMILIES, LAC_FAMILIES: LAC_FAMILIES,
    ANGLE_LABELS: ANGLE_LABELS, crossTitle: crossTitle
  };
}));
