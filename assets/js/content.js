// Program walkthroughs, the RB-Y1 run, and behaviors, from the paper's figures and appendix.
var IMG = 'assets/img/';

RAX.programs = [
  {
    id: 'cube', name: 'Find the Cube',
    summary: 'The operator hides a cube under one of four cups and shuffles them. The program watches the shuffle on the wrist camera, keeps track of every cup, and lifts the one that hides the cube.',
    phases: { see: 'Watching and choosing', move: 'Moving the arm' },
    steps: [
      { phase: 'see', title: 'Find the cube', img: 'prog/cube_height.jpg', tag: 'Height above table, 0–5 cm',
        text: 'Separates the cube from the cups by its height above the table in the depth image, not by its appearance.' },
      { phase: 'see', title: 'Watch the shuffle', img: 'prog/cube_f2_watch.jpg', tag: 'Wrist camera',
        text: 'Holds the arm still over the cups and follows every cup through the shuffle, remembering which one covered the cube. It also catches a cube that is moved or dropped into a cup.' },
      { phase: 'see', title: 'Choose the cup', img: 'prog/cube_f3_pick.jpg',
        text: 'Picks the cup that ends up holding the cube.', branch: 'If it saw nothing being hidden, it stops without moving.' },
      { phase: 'move', title: 'Look closer at the cup', img: 'prog/cube_f4_close.jpg',
        text: 'Moves in closer over the chosen cup.' },
      { phase: 'move', title: 'Lift the cup away', img: 'prog/cube_f5_reveal.jpg',
        text: 'Grasps the cup high and gently, and sets it aside to reveal the cube.', branch: 'No cube there: it lifts that cup again.' },
      { phase: 'move', title: 'Pick up the cube', img: 'prog/cube_f6_held.jpg',
        text: 'Grasps and lifts the cube; success is checked from the gripper width and the wrist camera.' }
    ]
  },
  {
    id: 'airfry', name: 'Air Fryer',
    summary: 'Open a heavy fryer drawer, drop a banana into the basket, and close it. One program handles four fryer layouts; this is the run with the fryer rotated.',
    phases: { open: 'Open the drawer', banana: 'Place the banana', close: 'Close the drawer' },
    steps: [
      { phase: 'open', title: 'Look from above', img: 'prog/airfry_top.jpg', tag: 'Lid circle and pull direction',
        text: 'Fits a circle to the lid for the fryer’s axis, and takes the pull direction from the handle’s points.' },
      { phase: 'open', title: 'Grasp the handle, 50 N', img: 'prog/airfry_grasp.jpg', inset: 'prog/airfry_wrist_grasp.jpg',
        text: 'Checks the whole pull for reachability and clearance before it moves, then grasps the handle’s outer face.' },
      { phase: 'open', title: 'Pull in 3 cm steps', img: 'prog/airfry_pull.jpg', tag: 'Opened 12.7 cm',
        text: 'Pulls step by step and measures the opening from the shift of the handle face.' },
      { phase: 'open', title: 'Measure the basket rim', img: 'prog/airfry_rim.jpg', tag: 'Rim 6.5 mm off the model',
        text: 'Fits a circle to the rim near where its model predicts it; the release uses the measured rim.' },
      { phase: 'banana', title: 'Pick the banana, 20 N', img: 'prog/airfry_pick.jpg',
        text: 'Grasps the banana at the middle of its fitted centre line, on its convex side.' },
      { phase: 'banana', title: 'Tilt the hand 60° and release', img: 'prog/airfry_release.jpg', inset: 'prog/airfry_wrist_release.jpg',
        text: 'Releases the banana over the basket with the hand tilted 60°.' },
      { phase: 'banana', title: 'Check the banana is inside', img: 'prog/airfry_inside.jpg', tag: 'Banana inside',
        text: 'Looks for the banana’s points inside the basket rim.' },
      { phase: 'close', title: 'Regrasp the handle', img: 'prog/airfry_regrasp.jpg', tag: '8 mm off target, accepted',
        text: 'Measures the handle again and grasps it within tolerance.' },
      { phase: 'close', title: 'Push to 2 cm short', img: 'prog/airfry_push.jpg', tag: 'Pushed in 4 steps',
        text: 'Pushes the drawer most of the way in.' },
      { phase: 'close', title: 'Close with the fingertips', img: 'prog/airfry_fingertip.jpg', tag: 'Closed, handle 1.3 mm from start',
        text: 'Finishes the push with the fingertips and checks that the handle is back where it started.' }
    ]
  },
  {
    id: 'wipe', name: 'Wipe the Table',
    summary: 'Wipe a soy-sauce stain with a wet towel, on an arm without a force sensor. The program presses by position, 12 mm below the contact height it measured, and checks the table with two cameras.',
    phases: { setup: 'Set up', towel: 'Towel', wipe: 'Wipe', check: 'Check' },
    steps: [
      { phase: 'setup', title: 'Find the stain and the towel', img: 'prog/wipe_find.jpg',
        text: 'Compares both exterior cameras with a picture of the clean table to find the stain, and locates the towel heap.' },
      { phase: 'towel', title: 'Grasp the towel as a wad', img: 'prog/wipe_grasp.jpg',
        text: 'Presses on the heap’s peak and grasps a thick wad of cloth.' },
      { phase: 'wipe', title: 'Carry, lower onto the stain', img: 'prog/wipe_carry.jpg',
        text: 'Carries the wad high and lowers it so that it piles into a pad on the stain.' },
      { phase: 'wipe', title: 'Zig-zag wipe', img: 'prog/wipe_wipe.jpg',
        text: 'Wipes a zig-zag fitted to the part of the stain the arm can reach.' },
      { phase: 'towel', title: 'Park the towel', img: 'prog/wipe_park.jpg',
        text: 'Parks the towel away from the stain.' },
      { phase: 'check', title: 'Check from two scales', img: 'prog/wipe_side.jpg', inset: 'prog/wipe_wrist.jpg', tag: 'Side camera, wrist camera inset',
        text: 'The wrist camera catches thin streaks that the exterior cameras miss.', branch: 'Not clean: it wipes the residue again.' },
      { phase: 'check', title: 'Done', compare: ['prog/wipe_done_before.jpg', 'prog/wipe_done_after.jpg'],
        text: 'Drag the divider to compare the table before and after.' }
    ]
  },
  {
    id: 'peg', name: 'Peg-in-Hole',
    summary: 'The ManipulationNet board: rows with 3 mm, 1 mm and 0.1 mm clearance, no chamfers, and a transparent board that depth cannot see well. The procedure finds holes by touch and tilts each peg into the tightest row.',
    phases: { acq: 'Pick up', seat: 'Find the hole', place: 'Insert' },
    steps: [
      { phase: 'acq', title: 'Fit the peg from above', img: 'prog/peg_f1_fit.jpg', inset: 'prog/peg_f1_wrist.jpg',
        text: 'Fits the outline of the peg’s top, from its CAD model, to the edges in the wrist image.' },
      { phase: 'acq', title: 'Grasp', img: 'prog/peg_f2_grasp.jpg',
        text: 'Grasps the peg at the fitted position and angle.' },
      { phase: 'seat', title: 'Drop into the 3 mm hole', img: 'prog/peg_f3_drop.jpg',
        text: 'Drops the peg into the 3 mm row, where it stands in the hole.' },
      { phase: 'seat', title: 'Centre by wall pushes', img: 'prog/peg_f4_centre.jpg',
        text: 'Regrasps the standing peg and centres it by pushing against the hole’s walls.' },
      { phase: 'seat', title: 'Probe for the 1 mm hole', img: 'prog/peg_f5_probe.jpg',
        text: 'Touches down at offsets on rings around the hole’s expected centre, stopping at 4 N, until the peg drops in.', branch: 'Not dropped in: it tries the next offset.' },
      { phase: 'seat', title: 'Dropped in', img: 'prog/peg_f6_in.jpg',
        text: 'The peg stands in the 1 mm hole.' },
      { phase: 'place', title: 'Regrasp and centre', img: 'prog/peg_f7_centre2.jpg',
        text: 'Regrasps the peg and centres it again.' },
      { phase: 'place', title: 'Tilt into the 0.1 mm hole', img: 'prog/peg_f8_tilt.jpg',
        text: 'Tilts the tool 6° and enters corner first.', branch: 'Corner stuck on the surface: it registers the board again.' },
      { phase: 'place', title: 'Upright, wiggle, push', img: 'prog/peg_f9_push.jpg',
        text: 'Turns the peg upright with small rocking pushes until it is seated.' },
      { phase: 'place', title: 'Open and lift', img: 'prog/peg_f10_open.jpg',
        text: 'Releases the peg and measures its depth: 19.7 to 21.0 mm of 21.8 mm for all three pegs.' }
    ]
  },
  {
    id: 'bandu', name: 'Bandu Tower',
    summary: 'Rebuild a tower of seven irregular wooden pieces, given only the finished tower. The program places each piece and checks its seat, with about 1 mm of play for the knob.',
    phases: { main: 'Find and grasp', place: 'Place', touch: 'By touch', cam: 'By camera' },
    steps: [
      { phase: 'main', title: 'Survey the table', img: 'prog/bandu_survey.jpg',
        text: 'Finds the pieces with both exterior cameras; Gemini names them, and a name is kept only if it fits the piece’s height.' },
      { phase: 'main', title: 'Grasp the piece', img: 'prog/bandu_grasp.jpg', inset: 'prog/bandu_wrist_grasp.jpg',
        text: 'Grasps the next piece; most pieces are grasped twice, at 0° and then at 90°.' },
      { phase: 'place', title: 'Place on its slot', img: 'prog/bandu_place.jpg', inset: 'prog/bandu_wrist_place.jpg',
        text: 'The ring, barrel, goblet and oblique cylinder are set down on their slots.', branch: 'One of three ways to seat a piece.' },
      { phase: 'touch', title: 'Probe for the seat', img: 'prog/bandu_probe.jpg', inset: 'prog/bandu_wrist_probe.jpg',
        text: 'The urn and the dowel are inserted by probing for the seat at 1.5 N.', branch: 'One of three ways to seat a piece.' },
      { phase: 'cam', title: 'Align by camera', img: 'prog/bandu_align.jpg', inset: 'prog/bandu_wrist_align.jpg',
        text: 'The knob is aligned over the urn’s opening from both exterior cameras, to 0.19 mm, before it descends.', branch: 'One of three ways to seat a piece.' },
      { phase: 'main', title: 'Verify the tower', img: 'prog/bandu_verify.jpg',
        text: 'After every piece, checks that each piece of the tower is in place in both exterior cameras; then the next piece.' }
    ]
  }
];

// RB-Y1, the final run of the tidy-up task.
RAX.skills = {
  chair: { name: 'office-chair-tuck', img: 'rby1/k_chair.jpg', what: 'Grasps the backrest bar with both grippers; pulls out, turns, drives, pushes in.' },
  cups: { name: 'stack-cups', img: 'rby1/k_cups.jpg', what: 'One-hand rim pinch; finds the cups from Gemini rim points and depth; aligns, inserts.' },
  bucket: { name: 'bimanual-bucket-rim-pnp', img: 'rby1/k_bucket.jpg', what: 'Both grippers pinch the rim; carries the bucket onto a cabinet.' },
  box: { name: 'bimanual-box-pnp', img: 'rby1/k_box.jpg', what: 'Bimanual squeeze; carries a box from the floor to a table.' }
};
RAX.rby1 = {
  start: '19:31',
  stages: [
    { title: 'Park the chair', time: '19:41', img: 'rby1/s1_park.jpg', skills: ['chair'],
      code: ['chair.measure()', 'chair.grasp()', 'route([pull(.5), turn(1.42),', '       drive(1.45), turn(-1.57)])', 'chair.release()'] },
    { title: 'Stack the cups', time: '20:04', img: 'rby1/s2_cups.jpg', skills: ['cups'],
      code: ['cups.scan("silver cup at the back left",', '          "silver cup in the front next to the banana")', 'cups.pick(front, "left")', 'cups.align(back, "left", dx=.022, dy=.014)', 'cups.insert("left")'] },
    { title: 'Cups and banana into the bucket', time: '20:20', img: 'rby1/s3_bucket.jpg', skills: ['cups'],
      code: ['# stack: staged pick on cups code', 'cups.locate("silver cup")', 'pick_staged("right", depth=.04)', '# banana: new, on cups grasp code', 'banana_pick(mid, tangent, "left")', 'torso("ready")  # stand up', 'drop("right"); drop("left")'] },
    { title: 'Bucket onto the cabinet', time: '20:39', img: 'rby1/s4_cabinet.jpg', skills: ['bucket'],
      code: ['bucket.run(stop="find_bucket")', 'bucket.run("final_approach", stop="pregrasp")', 'bucket.run("grasp_lift")', 'world["cabinet"] = own_depth()', 'bucket.run("lower_to_touch")', 'bucket.run("release")'] },
    { title: 'Tuck the chair', time: '20:54', img: 'rby1/s5_tuck.jpg', skills: ['chair'],
      code: ['chair.measure()  # twice', 'chair.grasp()', 'route([pull(.6), turn(-1.73),', '       drive(1.52), turn(1.57)])', 'route([turn(.48), drive(.27), turn(-.39)])', 'chair.tuck(1.49, 0.551)', 'chair.release()'] },
    { title: 'Box onto the cabinet', time: '21:09', img: 'rby1/s6_box.jpg', skills: ['box'],
      code: ['box.run(stop="plan_approach")', 'box.run("drive_approach", stop="check_stance")', 'box.run("grasp", stop="lift")', 'edge_x = own_depth()  # 0.59', 'box.run("approach_table", edge_x=0.59)', 'box.run("place")'] }
  ]
};

// Mistakes on real robots and the rule the agent kept.
RAX.incidents = [
  { robot: 'RB-Y1', title: 'A hand-planned turn hits the cabinet',
    frames: [['behave/seq_4294.jpg', '0 s, turning'], ['behave/seq_4298.jpg', '4 s, rear swings in'], ['behave/seq_4300_5.jpg', '6.5 s, contact'], ['behave/seq_4303.jpg', '9 s, cabinet pushed']],
    what: 'An in-place 151° turn swept the base’s rear through a 0.63 m circle and pushed the cabinet, with the bucket on it, by 0.2 to 0.3 m.',
    rule: 'Every base move is checked against the area the base sweeps before it runs.', ruleImg: 'behave/plan_place.png' },
  { robot: 'RB-Y1', title: 'Squatting overloads a wrist',
    frames: [['behave/p_overload.jpg', 'Wrist at 130 %, stop at 150 %']],
    what: 'Lifting the bucket while squatting to pinch its rim overloaded a wrist and stopped the robot.',
    rule: 'Stand up before the lift, a correction from the operator, kept as a rule in the skill.', ruleImg: 'behave/p_standup.jpg' },
  { robot: 'Franka', title: 'An unusual posture hits a camera',
    frames: [['behave/arm_flipped.png', 'Flipped elbow, 1 cm from the camera']],
    what: 'An unusual arm posture drove the elbow into the left camera.',
    rule: 'Plan only natural, elbow-up postures with keep-out zones around the cameras (13 cm clearance on the same pick), and re-register the bumped camera.', ruleImg: 'behave/arm_natural.png' }
];

// Requests the agent sent to the operator.
RAX.requests = [
  { task: 'ManipulationNet peg-in-hole', time: '01:24', msg: 'The board slips during tight fits: please tape it down.',
    before: ['behave/h_peg_before.jpg', 'before'], after: ['behave/h_peg_after.jpg', 'taped'] },
  { task: 'Air fryer', time: '11:57', msg: 'Please move the banana: too close to the camera I hit.',
    before: ['behave/h_ban_before.jpg', 'requested'], after: ['behave/h_ban_after.jpg', 'moved'] }
];

// Programs adapted to a changed task: lines new, modified, or reused.
RAX.adapt = [
  { name: 'Find the cube',
    operator: 'we will drop the cube into the cup from above then turn it over, before shuffling, instead of turning the cup over the cube.',
    images: [['behave/strobe_orig.jpg', 'Learned: a cup put over the cube', 0], ['behave/strobe_drop.jpg', 'Change 1: cube dropped into a cup', 1], ['behave/strobe_wedge.jpg', 'Change 2: a red wedge tossed in', 1]],
    story: 'The program stopped without moving: it had not seen the cube being covered. The agent added a detector for a cube inside a cup, checked it on its earlier recordings, and resumed the same scene.',
    title: 'Main loop of the find-the-cube program, after both changes',
    lines: [
      ['goto_watch(ctx)', '', ''],
      ["model = step_find_cube(ctx)['model']", 'mod', 'size, colour, height'],
      ['w = wait_shuffle(ctx)', '', ''],
      ['r = identify_cup(t0, t1, px, frame, model)', 'mod', 'tracker + cube_in_cup()'],
      ["r2 = locate_cups_now(ctx, r['cover_id'])", '', ''],
      ["r3 = remove_cup(ctx, r2['target'])", '', ''],
      ["grasp_cube(ctx, r3['cup'], model)", 'mod', 'two-axis grasp'],
      ['# 20 of 41 functions and the cup tracker unchanged', '', '']
    ] },
  { name: 'Wiping with paper towels',
    operator: 'pull paper towels out of the box, wipe table, and then throw them into the waste bin.',
    images: [['behave/wipe2.jpg', 'Learned: a wet towel', 0], ['behave/wipe3.jpg', 'New: a sheet from the box', 1], ['behave/wipe6.jpg', 'New: the wad into the bin', 1]],
    story: 'The new program imports the towel program unchanged: stain detection, the reachable region, the press, the zig-zag, and the residue check. Only the paper handling is new.',
    title: 'Main loop of the paper-towel program; S and P are towel-program modules',
    lines: [
      ["frame = S.observe(ctx, log, 'start')", '', ''],
      ['box, bin = T.tissue_box(frame), T.bin_opening(frame)', 'new', ''],
      ['stain = P.locate_stain(frame, ref, exclude=keep_out)', '', 'vs. the clean table'],
      ['region = S.fit_region(ctx, stain, log)', '', 'reachable region'],
      ['for xy in drop_points(region, 6):', 'new', ''],
      ['    pull_one(ctx, log, box, bin)', 'new', 'pinch, pull up'],
      ['    T.drop_at(ctx, xy, log)', 'new', 'pile on the stain'],
      ['S._press_grasp(ctx, px, py, top + 0.06, ...)', '', 'press, grasp the wad'],
      ["S.wipe_region(ctx, region, log, mode='drag')", '', '12 mm press, zig-zag'],
      ['T.dispose(ctx, bin, log)', 'new', 'over the bin'],
      ['sweep_leftovers(ctx, log, ref, keep_out, bin)', 'new', ''],
      ['res = S.measure_residue(frame, ref, roi)', '', 'exterior + wrist']
    ] }
];
