// Numbers from the paper's tables and figures.
window.RAX = {};

// Figure 1: mean score on unseen scenes against the exploration budget, averaged within each
// benchmark first and then across benchmarks (DexJoCo: bimanual tasks; LIBERO-Pro: position perturbation).
RAX.scaling = {
  budgets: [4, 8, 16, 32, 128],
  mean: [24.9, 35.9, 62.3, 66.8, 78.6],
  prior: 41.2,
  benchmarks: [
    { name: 'RoboDojo', values: [22.1, 39.7, 64.4, 74.8, 78.3], prior: 24.9 },
    { name: 'BEHAVIOR-1K', values: [0.0, 0.0, 0.0, 0.0, 46.5], prior: 8.2 },
    { name: 'HumanoidArena', values: [62.4, 65.5, 71.2, 80.7, 89.8], prior: 81.9 },
    { name: 'DexJoCo', values: [40.1, 74.1, 91.3, 94.3, 94.3], prior: 48.8 },
    { name: 'LIBERO-Pro', values: [0.0, 0.0, 84.4, 84.4, 84.4], prior: 42.2 }
  ]
};

// Per-benchmark tables. null: not run or not reported.
RAX.benchmarks = [
  {
    id: 'robodojo', name: 'RoboDojo', metric: 'Score (%) on unseen layouts',
    setting: 'Dual-arm ARX X5. RAX explores from an empty workspace; baselines are the top five policies of the RoboDojo-Sim leaderboard, trained on demonstrations.',
    tasks: ['Make toast random', 'Hang mugs random', 'Sweep blocks random', 'Plug charger', 'Swap blocks', 'Make kong', 'Pour by language'],
    rax: [47.2, 39.2, 71.7, 94.0, 100.0, 96.0, 100.0], raxAvg: 78.3,
    baselines: [
      ['VPP2', [38.0, 13.5, 1.3, 16.7, 26.0, 78.7, 0.0], 24.9],
      ['Awomo-0.5', [7.0, 9.6, 0.0, 7.3, 4.7, 30.0, 0.0], 8.4],
      ['Simate-beta', [7.7, 11.4, 0.0, 29.3, 38.7, 76.0, 0.0], 23.3],
      ['Rex-M1 Preview', [14.3, 20.2, 8.0, 3.3, 13.3, 33.3, 0.0], 13.2],
      ['VPP2-Preview', [13.7, 14.5, 2.7, 6.0, 22.7, 34.7, 0.0], 13.5],
      ['PhysicalRSI (agent + VLA)', [4.7, 2.0, 0.0, 30.7, 0.0, 82.0, 10.1], 18.5]
    ],
    curves: {
      budgets: [4, 8, 16, 32, 64],
      tasks: [
        [null, null, 2.5, 31.7, 47.2], [null, null, 36.9, 33.3, 39.2], [null, null, 53.3, 68.3, 71.7],
        [26.0, 94.0, null, null, null], [34.0, 74.0, 100.0, null, null], [0.0, 0.0, 64.0, 96.0, null],
        [94.4, 100.0, null, null, null]
      ]
    }
  },
  {
    id: 'behavior', name: 'BEHAVIOR-1K', metric: 'Q-score (%) on the ten public test instances',
    setting: 'Galaxea R1Pro, six long-horizon household tasks of the 2025 BEHAVIOR Challenge, 100 to 128 exploration episodes. Baselines are the five highest-ranked challenge entries.',
    tasks: ['Boxing books', 'Getting organized', 'Sorting items', 'Clearing food', 'Clean up desk', 'Loading the car'],
    rax: [26.7, 9.0, 75.0, 40.0, 28.2, 100.0], raxAvg: 46.5,
    baselines: [
      ['Robot Learning Collective', [0.0, 2.0, 6.2, 8.0, 12.7, 20.0], 8.2],
      ['Comet', [0, 0, 0, 0, 0, 0], 0.0],
      ['SimpleAI Robot', [0, 0, 0, 0, 0, 0], 0.0],
      ['The North Star', [0, 0, 0, 0, 0, 20.0], 3.3],
      ['Embodied Intelligence (privileged)', [0, 0, 0, 0, 0, 0], 0.0]
    ]
  },
  {
    id: 'humanoid', name: 'HumanoidArena', metric: 'Success rate (%) on the 60 official test episodes',
    setting: 'Unitree G1 with Dex3 hands and the SONIC tracker. RAX sees 3 demonstrations; every baseline is trained on 100.',
    tasks: ['Football', 'DoubleDesk', 'P&PBox', 'OpenDoor', 'SitSofa', 'Boxing', 'VisNavi'],
    rax: [98.3, 56.7, 83.3, 100.0, 96.7, 100.0, 93.3], raxAvg: 89.8,
    baselines: [
      ['ACT', [16.7, 18.3, 56.7, 78.3, 73.3, 56.7, 33.3], 47.6],
      ['Diffusion Policy', [45.0, 36.7, 75.0, 85.0, 78.3, 76.7, 23.3], 60.0],
      ['Flow matching', [13.3, 38.3, 73.3, 70.0, 15.0, 70.0, 38.3], 45.5],
      ['π0.5', [10.0, 43.3, 71.7, 66.7, 73.3, 70.0, 23.3], 51.2],
      ['WB-WAM', [70.0, 65.0, 86.7, 98.3, 95.0, 81.7, 76.7], 81.9]
    ],
    curves: {
      budgets: [2, 4, 8, 16, 32, 64, 128],
      avg: [52.1, 62.4, 65.5, 71.2, 80.7, null, null],
      tasks: [
        [40.0, 51.7, 76.7, 96.7, 98.3, null, null], [0.0, 1.7, 5.0, 28.3, 25.0, 25.0, 56.7],
        [0.0, 16.7, 23.3, 20.0, 51.7, 46.7, 83.3], [98.3, 93.3, 93.3, 93.3, 100.0, null, null],
        [96.7, 98.3, 100.0, 96.7, 96.7, null, null], [58.3, 95.0, 80.0, 80.0, 100.0, null, null],
        [71.7, 80.0, 80.0, 83.3, 93.3, null, null]
      ]
    }
  },
  {
    id: 'dexjoco', name: 'DexJoCo', metric: 'Success rate (%) on 150 official episodes, rand-obj',
    setting: 'Franka arms with 16-DoF Allegro hands, six single-arm and five bimanual tasks. RAX gets three completion images and no demonstrations; baselines train on 100 demonstrations per task.',
    avgNote: '‡ Mean over the ten tasks other than iPad.',
    tasks: ['Hammer', 'Mouse', 'Bucket', 'Tongs', 'Glasses', 'Water', 'iPad', 'Hanoi', 'Assembly', 'Microwave', 'Photo'],
    rax: [100.0, 100.0, 100.0, 100.0, 100.0, 99.3, 100.0, 100.0, 96.0, 99.3, 100.0], raxAvg: 99.5,
    baselines: [
      ['DP-T', [81.3, 62.0, 83.3, 22.7, 53.3, 84.0, 8.0, 24.7, 4.7, 73.3, 56.7], 50.4],
      ['DP-C', [58.7, 74.0, 70.0, 57.3, 54.0, 63.3, 52.0, 12.7, 3.3, 54.0, 24.0], 47.6],
      ['ACT', [50.0, 61.3, 64.0, 31.3, 47.3, 47.3, 9.3, 6.0, 0.0, 66.0, 7.3], 35.5],
      ['π0.5', [84.7, 64.7, 84.0, 24.0, 72.0, 88.7, 36.0, 23.3, 2.7, 60.0, 54.7], 54.1],
      ['GR00T N1.5', [67.3, 85.3, 72.0, 12.7, 27.3, 72.7, 12.7, 0.7, 0.7, 50.7, 40.7], 40.2],
      ['GR00T N1.6', [58.0, 66.0, 94.0, 33.3, 51.3, 77.3, null, 24.7, 4.0, 76.7, 30.0], 51.5, '‡'],
      ['DECO', [68.0, 90.0, 80.0, 46.0, 50.0, 88.0, 40.0, 18.0, 0.0, 64.0, 76.0], 56.4],
      ['Fast-WAM', [43.3, 77.3, 81.3, 47.3, 62.7, 42.7, null, 42.0, 2.7, 88.7, 40.7], 52.9, '‡'],
      ['PointWAM', [82.0, 89.3, 96.7, 50.0, 62.0, 94.7, null, 36.0, 11.3, 72.0, 24.0], 61.8, '‡'],
      ['ME-Dex', [86.0, 76.0, 92.0, 92.0, 56.0, 72.0, 48.0, 32.0, 28.0, 88.0, 48.0], 65.3]
    ],
    curves: {
      budgets: [2, 4, 8, 16, 32],
      avg: [31.9, 44.8, 86.9, 91.3, 96.7],
      tasks: [
        [98.7, 98.7, 94.0, 98.0, 100.0], [100.0, 97.3, 100.0, 100.0, 100.0], [0.0, 93.3, 100.0, 96.7, 100.0],
        [36.7, 2.7, 100.0, 99.3, 100.0], [0.7, 0.0, 100.0, 55.3, 93.3], [0.0, 0.0, 91.3, 98.7, 99.3],
        [100.0, 100.0, 100.0, 100.0, 100.0], [0.0, 100.0, 100.0, 98.7, 100.0], [14.7, 0.7, 0.0, 96.0, 72.0],
        [0.0, 0.0, 84.0, 93.3, 99.3], [0.0, 0.0, 86.7, 68.7, 100.0]
      ]
    }
  },
  {
    id: 'liberopro', name: 'LIBERO-Pro', metric: 'Success rate (%) on 50 position-perturbed states per task',
    setting: 'Franka Panda with a parallel gripper; objects swap their initial regions. RAX uses no demonstrations and at most 5 episodes of adaptation; baselines fine-tune on 50 demonstrations per task.',
    tasks: ['Spatial', 'Object', 'Goal', 'Long'],
    rax: [79.2, 100.0, 87.0, 71.4], raxAvg: 84.4,
    raxNote: 'Without any episode on perturbed layouts: 79.2, 100.0, 68.8, 51.2 (avg 74.8).',
    baselines: [
      ['OpenVLA', [0.0, 0.0, 0.0, 0.0], 0.0],
      ['π0', [0.0, 0.0, 0.0, 0.0], 0.0],
      ['π0.5', [20.0, 17.0, 38.0, 8.0], 20.8],
      ['X-VLA', [0.0, 2.0, 1.0, 0.0], 0.8],
      ['VPP2', [54.0, 58.0, 37.0, 20.0], 42.3],
      ['ASPIRE (coding agent)', [51.0, 98.0, 81.0, 22.6], 63.2]
    ]
  },
  {
    id: 'libero', name: 'LIBERO', metric: 'Success rate (%) on the 50 official initial states per task',
    setting: 'Franka Panda, four ten-task suites. RAX uses no demonstrations; baselines fine-tune on 50 demonstrations per task.',
    tasks: ['Spatial', 'Object', 'Goal', 'Long'],
    rax: [99.2, 100.0, 98.6, 96.2], raxAvg: 98.5,
    baselines: [
      ['OpenVLA', [84.7, 88.4, 79.2, 53.7], 76.5],
      ['OpenVLA-OFT', [97.6, 98.4, 97.9, 94.5], 97.1],
      ['π0', [96.8, 98.8, 95.8, 85.2], 94.2],
      ['π0.5', [98.8, 98.2, 98.0, 92.4], 96.9],
      ['X-VLA', [98.2, 98.6, 97.8, 97.6], 98.1],
      ['Cosmos Policy', [98.1, 100.0, 98.2, 97.6], 98.5],
      ['Fast-WAM', [98.2, 100.0, 97.0, 95.2], 97.6],
      ['VPP2', [99.2, 99.8, 98.2, 98.0], 98.8]
    ]
  }
];

// Inference time per successful exploration episode: [episode, minutes, output k-tokens, program alone].
RAX.agentTime = {"car":[[11,122.796,253.7,0],[25,22.818,63.1,0],[26,39.223,72.7,0],[29,10.172,24.4,0],[30,11.66,24.4,0],[31,16.921,71.3,0],[33,3.719,51.5,0],[34,9.74,60.9,0],[36,3.791,59.9,0],[37,20.888,79.8,0],[38,13.216,65.7,0],[39,14.414,90.9,0],[43,18.776,85.1,0],[46,5.189,60.3,0],[47,38.775,119.9,0],[49,4.086,96.2,0],[50,4.793,40.4,0],[51,3.568,17.7,0],[52,5.64,32.8,0],[53,3.53,13.1,0],[54,11.798,51.1,0],[55,3.512,36.9,0],[56,3.607,7.9,0],[57,3.516,8.5,0],[58,3.443,34.1,0],[59,13.065,39.1,0],[60,3.374,25.1,0],[61,3.268,24.7,0],[62,10.154,22.4,0],[63,27.078,34.9,0],[64,3.383,23.7,0],[65,18.559,58.1,0],[66,3.446,50.1,0],[67,3.481,26.7,0],[68,3.784,30.6,0],[69,15.492,23.3,0],[70,4.258,21.3,0],[71,3.491,8.9,0],[73,3.819,27.1,0],[74,7.735,24.7,0],[75,5.78,27.7,0],[76,3.896,23.2,0],[77,15.451,11.1,0],[78,3.691,8.1,0],[79,3.633,3.6,0],[80,4.151,2.9,0],[81,15.23,61.8,0],[82,3.56,46.3,0],[83,16.306,36.9,0],[85,5.946,86.4,0],[86,8.052,87.6,0],[87,20.975,48.5,0],[88,4.272,45.1,0],[89,3.663,49.9,0],[90,3.667,47.9,0],[91,3.903,27.3,0],[92,4.084,27.8,0],[93,6.856,8.3,0],[94,9.769,5.5,0],[95,3.338,43.4,0],[96,3.564,43.2,0],[99,3.692,3.4,0],[100,4.097,3.3,0],[101,3.848,6.5,0],[102,4.014,5.0,0],[103,3.819,4.0,0],[104,3.84,3.6,0],[105,3.985,22.1,0],[106,3.841,22.5,0],[107,11.668,13.9,0],[108,3.797,12.3,0],[117,4.293,3.5,0],[118,4.186,3.0,0],[119,4.77,3.6,0],[120,4.155,3.2,0],[121,12.277,27.8,0],[122,5.237,24.9,0],[123,4.247,6.5,0],[124,4.989,6.3,0],[125,5.922,7.2,0],[126,4.113,5.4,0],[127,4.094,4.6,0],[128,4.16,4.1,0]],"toast":[[6,17.119,31.8,0],[7,7.863,25.0,0],[10,7.794,21.5,0],[11,1.727,11.1,0],[15,4.318,17.5,0],[17,0.112,0.0,1],[22,0.056,0.0,1],[27,0.119,0.0,1],[36,4.953,36.5,0],[37,0.098,12.1,0],[39,0.097,11.5,0],[52,0.081,0.0,1],[55,0.08,0.0,1],[57,0.078,0.0,1],[64,0.074,0.0,1]]};

// Real Franka: first success with every action from the agent, then an unattended run of its program.
RAX.realSpeed = [
  { task: 'Air fryer', agent: { inference: 72.3 * 60, robot: 2.9 * 60, tokens: 262.4 }, program: { inference: 18, robot: 2.5 * 60, tokens: 2.0 } },
  { task: 'Bandu tower', agent: { inference: 17.2 * 60, robot: 9.3 * 60, tokens: 88.4 }, program: { inference: 10, robot: 10.9 * 60, tokens: 2.2 } }
];
