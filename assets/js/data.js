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
    ]
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
    ]
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
    ]
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
