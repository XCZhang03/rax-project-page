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
      { phase: 'see', viz: [{ img: 'viz/cube_track.jpg', cap: 'Its tracker during the shuffle: one ring per tracked cup, and the box where it last saw the cube.' }], title: 'Watch the shuffle', img: 'prog/cube_f2_watch.jpg', vid: 'vid/prog/cube_f2_watch.mp4', poster: 'vid/prog/cube_f2_watch.jpg', tag: 'Wrist camera',
        text: 'Holds the arm still over the cups and follows every cup through the shuffle, remembering which one covered the cube. It also catches a cube that is moved or dropped into a cup.' },
      { phase: 'see', title: 'Choose the cup', img: 'prog/cube_f3_pick.jpg',
        text: 'Picks the cup that ends up holding the cube.', branch: 'If it saw nothing being hidden, it stops without moving.' },
      { phase: 'move', title: 'Look closer at the cup', img: 'prog/cube_f4_close.jpg', vid: 'vid/prog/cube_f4_close.mp4', poster: 'vid/prog/cube_f4_close.jpg',
        text: 'Moves in closer over the chosen cup.' },
      { phase: 'move', title: 'Lift the cup away', img: 'prog/cube_f5_reveal.jpg', vid: 'vid/prog/cube_f5_reveal.mp4', poster: 'vid/prog/cube_f5_reveal.jpg',
        text: 'Grasps the cup high and gently, and sets it aside to reveal the cube.', branch: 'No cube there: it lifts that cup again.' },
      { phase: 'move', title: 'Pick up the cube', img: 'prog/cube_f6_held.jpg', vid: 'vid/prog/cube_f6_held.mp4', poster: 'vid/prog/cube_f6_held.jpg',
        text: 'Grasps and lifts the cube; success is checked from the gripper width and the wrist camera.' }
    ]
  },
  {
    id: 'airfry', name: 'Air Fryer',
    summary: 'Open a heavy fryer drawer, drop a banana into the basket, and close it. One program handles four fryer layouts; this is the run with the fryer rotated.',
    phases: { open: 'Open the drawer', banana: 'Place the banana', close: 'Close the drawer' },
    steps: [
      { phase: 'open', viz: [{ img: 'viz/airfry_lid.jpg', cap: 'A circle fitted to the lid’s depth points gives the fryer’s axis; the arrow is the pull direction from the handle.' }], title: 'Look from above', img: 'prog/airfry_top.jpg', vid: 'vid/prog/airfry_top.mp4', poster: 'vid/prog/airfry_top.jpg', tag: 'Lid circle and pull direction',
        text: 'Fits a circle to the lid for the fryer’s axis, and takes the pull direction from the handle’s points.' },
      { phase: 'open', viz: [{ img: 'viz/airfry_feas.png', cap: 'Before the fryer was moved, it checked 36 fryer poses (3 handle directions × 12 positions) for reach and clearance at every step: 35 feasible.' }], title: 'Grasp the handle, 50 N', img: 'prog/airfry_grasp.jpg', vid: 'vid/prog/airfry_grasp.mp4', poster: 'vid/prog/airfry_grasp.jpg',
        text: 'Checks the whole pull for reachability and clearance before it moves, then grasps the handle’s outer face.' },
      { phase: 'open', title: 'Pull in 3 cm steps', img: 'prog/airfry_pull.jpg', vid: 'vid/prog/airfry_pull.mp4', poster: 'vid/prog/airfry_pull.jpg', tag: 'Opened 12.7 cm',
        text: 'Pulls step by step and measures the opening from the shift of the handle face.' },
      { phase: 'open', title: 'Measure the basket rim', img: 'prog/airfry_rim.jpg', vid: 'vid/prog/airfry_rim.mp4', poster: 'vid/prog/airfry_rim.jpg', tag: 'Rim 6.5 mm off the model',
        text: 'Fits a circle to the rim near where its model predicts it; the release uses the measured rim.' },
      { phase: 'banana', title: 'Pick the banana, 20 N', img: 'prog/airfry_pick.jpg', vid: 'vid/prog/airfry_pick.mp4', poster: 'vid/prog/airfry_pick.jpg',
        text: 'Grasps the banana at the middle of its fitted centre line, on its convex side.' },
      { phase: 'banana', viz: [{ img: 'viz/airfry_drop.png', cap: 'The release pose checked against its fryer model: the hand tilted 60° over the basket.' }], title: 'Tilt the hand 60° and release', img: 'prog/airfry_release.jpg', vid: 'vid/prog/airfry_release.mp4', poster: 'vid/prog/airfry_release.jpg',
        text: 'Releases the banana over the basket with the hand tilted 60°.' },
      { phase: 'banana', title: 'Check the banana is inside', img: 'prog/airfry_inside.jpg', vid: 'vid/prog/airfry_inside.mp4', poster: 'vid/prog/airfry_inside.jpg', tag: 'Banana inside',
        text: 'Looks for the banana’s points inside the basket rim.' },
      { phase: 'close', title: 'Regrasp the handle', img: 'prog/airfry_regrasp.jpg', vid: 'vid/prog/airfry_regrasp.mp4', poster: 'vid/prog/airfry_regrasp.jpg', tag: '8 mm off target, accepted',
        text: 'Measures the handle again and grasps it within tolerance.' },
      { phase: 'close', title: 'Push to 2 cm short', img: 'prog/airfry_push.jpg', vid: 'vid/prog/airfry_push.mp4', poster: 'vid/prog/airfry_push.jpg', tag: 'Pushed in 4 steps',
        text: 'Pushes the drawer most of the way in.' },
      { phase: 'close', title: 'Close with the fingertips', img: 'prog/airfry_fingertip.jpg', vid: 'vid/prog/airfry_fingertip.mp4', poster: 'vid/prog/airfry_fingertip.jpg', tag: 'Closed, handle 1.3 mm from start',
        text: 'Finishes the push with the fingertips and checks that the handle is back where it started.' }
    ]
  },
  {
    id: 'wipe', name: 'Wipe the Table',
    summary: 'Wipe a soy-sauce stain with a wet towel, on an arm without a force sensor. The program presses by position, 12 mm below the contact height it measured, and checks the table with two cameras.',
    phases: { setup: 'Set up', towel: 'Towel', wipe: 'Wipe', check: 'Check' },
    steps: [
      { phase: 'setup', viz: [{ img: 'viz/wipe_detect.png', cap: 'The stain (orange) found against the clean-table reference in both side cameras, and the towel heap (blue) with its peak (×).' }], title: 'Find the stain and the towel', img: 'prog/wipe_find.jpg', vid: 'vid/prog/wipe_find.mp4', poster: 'vid/prog/wipe_find.jpg',
        text: 'Compares both exterior cameras with a picture of the clean table to find the stain, and locates the towel heap.' },
      { phase: 'towel', title: 'Grasp the towel as a wad', img: 'prog/wipe_grasp.jpg', vid: 'vid/prog/wipe_grasp.mp4', poster: 'vid/prog/wipe_grasp.jpg',
        text: 'Presses on the heap’s peak and grasps a thick wad of cloth.' },
      { phase: 'wipe', title: 'Carry, lower onto the stain', img: 'prog/wipe_carry.jpg', vid: 'vid/prog/wipe_carry.mp4', poster: 'vid/prog/wipe_carry.jpg',
        text: 'Carries the wad high and lowers it so that it piles into a pad on the stain.' },
      { phase: 'wipe', viz: [{ img: 'viz/wipe_path.png', cap: 'The zig-zag planned over the reachable part of the stain, with the path the gripper actually took.' }], title: 'Zig-zag wipe', img: 'prog/wipe_wipe.jpg', vid: 'vid/prog/wipe_wipe.mp4', poster: 'vid/prog/wipe_wipe.jpg',
        text: 'Wipes a zig-zag fitted to the part of the stain the arm can reach.' },
      { phase: 'towel', title: 'Park the towel', img: 'prog/wipe_park.jpg', vid: 'vid/prog/wipe_park.mp4', poster: 'vid/prog/wipe_park.jpg',
        text: 'Parks the towel away from the stain.' },
      { phase: 'check', viz: [{ img: 'viz/wipe_residue.png', cap: 'The wrist camera at 1 mm per cell finds streaks the side cameras missed (16.4 cm²).' }], title: 'Check from two scales', img: 'prog/wipe_side.jpg', inset: 'prog/wipe_wrist.jpg', tag: 'Side camera, wrist camera inset',
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
      { phase: 'acq', viz: [{ img: 'viz/peg_edges.jpg', cap: 'Edges of the wrist image.' }, { img: 'viz/peg_fit.jpg', cap: 'The CAD outline of the peg’s top fitted to those edges: centre and yaw.' }], title: 'Fit the peg from above', img: 'prog/peg_f1_fit.jpg', vid: 'vid/prog/peg_f1_fit.mp4', poster: 'vid/prog/peg_f1_fit.jpg',
        text: 'Fits the outline of the peg’s top, from its CAD model, to the edges in the wrist image.' },
      { phase: 'acq', title: 'Grasp', img: 'prog/peg_f2_grasp.jpg', vid: 'vid/prog/peg_f2_grasp.mp4', poster: 'vid/prog/peg_f2_grasp.jpg',
        text: 'Grasps the peg at the fitted position and angle.' },
      { phase: 'seat', viz: [{ img: 'viz/peg_reg.jpg', cap: 'The board’s CAD holes projected at the pose it registered: rows of 3, 1 and 0.1 mm clearance.' }], title: 'Drop into the 3 mm hole', img: 'prog/peg_f3_drop.jpg', vid: 'vid/prog/peg_f3_drop.mp4', poster: 'vid/prog/peg_f3_drop.jpg',
        text: 'Drops the peg into the 3 mm row, where it stands in the hole.' },
      { phase: 'seat', title: 'Centre by wall pushes', img: 'prog/peg_f4_centre.jpg', vid: 'vid/prog/peg_f4_centre.mp4', poster: 'vid/prog/peg_f4_centre.jpg',
        text: 'Regrasps the standing peg and centres it by pushing against the hole’s walls.' },
      { phase: 'seat', viz: [{ img: 'viz/peg_hop.png', cap: '36 probe offsets on rings around the expected centre; 35 rest on the surface, the last drops 21.7 mm into the hole.' }], title: 'Probe for the 1 mm hole', img: 'prog/peg_f5_probe.jpg', vid: 'vid/prog/peg_f5_probe.mp4', poster: 'vid/prog/peg_f5_probe.jpg',
        text: 'Touches down at offsets on rings around the hole’s expected centre, stopping at 4 N, until the peg drops in.', branch: 'Not dropped in: it tries the next offset.' },
      { phase: 'seat', title: 'Dropped in', img: 'prog/peg_f6_in.jpg', vid: 'vid/prog/peg_f6_in.mp4', poster: 'vid/prog/peg_f6_in.jpg',
        text: 'The peg stands in the 1 mm hole.' },
      { phase: 'place', title: 'Regrasp and centre', img: 'prog/peg_f7_centre2.jpg', vid: 'vid/prog/peg_f7_centre2.mp4', poster: 'vid/prog/peg_f7_centre2.jpg',
        text: 'Regrasps the peg and centres it again.' },
      { phase: 'place', viz: [{ img: 'viz/peg_tilt.png', cap: 'Corner height at each step of the tilted entry, then the peg’s depth through the wiggle-push, to 21.0 mm.' }], title: 'Tilt into the 0.1 mm hole', img: 'prog/peg_f8_tilt.jpg', vid: 'vid/prog/peg_f8_tilt.mp4', poster: 'vid/prog/peg_f8_tilt.jpg',
        text: 'Tilts the tool 6° and enters corner first.', branch: 'Corner stuck on the surface: it registers the board again.' },
      { phase: 'place', title: 'Upright, wiggle, push', img: 'prog/peg_f9_push.jpg', vid: 'vid/prog/peg_f9_push.mp4', poster: 'vid/prog/peg_f9_push.jpg',
        text: 'Turns the peg upright with small rocking pushes until it is seated.' },
      { phase: 'place', title: 'Open and lift', img: 'prog/peg_f10_open.jpg', vid: 'vid/prog/peg_f10_open.mp4', poster: 'vid/prog/peg_f10_open.jpg',
        text: 'Releases the peg and measures its depth: 19.7 to 21.0 mm of 21.8 mm for all three pegs.' }
    ]
  },
  {
    id: 'bandu', name: 'Bandu Tower',
    summary: 'Rebuild a tower of seven irregular wooden pieces, given only the finished tower. The program places each piece and checks its seat, with about 1 mm of play for the knob.',
    phases: { main: 'Find and grasp', place: 'Place', touch: 'By touch', cam: 'By camera' },
    steps: [
      { phase: 'main', viz: [{ img: 'viz/bandu_survey.jpg', cap: 'Pieces found as point clusters both exterior cameras see, each named by Gemini only if the name fits its height.' }], title: 'Survey the table', img: 'prog/bandu_survey.jpg', vid: 'vid/prog/bandu_survey.mp4', poster: 'vid/prog/bandu_survey.jpg',
        text: 'Finds the pieces with both exterior cameras; Gemini names them, and a name is kept only if it fits the piece’s height.' },
      { phase: 'main', title: 'Grasp the piece', img: 'prog/bandu_grasp.jpg', vid: 'vid/prog/bandu_grasp.mp4', poster: 'vid/prog/bandu_grasp.jpg',
        text: 'Grasps the next piece; most pieces are grasped twice, at 0° and then at 90°.' },
      { phase: 'place', title: 'Place on its slot', img: 'prog/bandu_place.jpg', vid: 'vid/prog/bandu_place.mp4', poster: 'vid/prog/bandu_place.jpg',
        text: 'The ring, barrel, goblet and oblique cylinder are set down on their slots.', branch: 'One of three ways to seat a piece.' },
      { phase: 'touch', viz: [{ img: 'viz/bandu_probes.png', cap: 'Probing the urn’s seat at 1.5 N: +6.48 and +4.50 mm above it, then +4.45 mm, accepted.' }], title: 'Probe for the seat', img: 'prog/bandu_probe.jpg', vid: 'vid/prog/bandu_probe.mp4', poster: 'vid/prog/bandu_probe.jpg',
        text: 'The urn and the dowel are inserted by probing for the seat at 1.5 N.', branch: 'One of three ways to seat a piece.' },
      { phase: 'cam', viz: [{ img: 'viz/bandu_align.jpg', cap: 'The knob’s foot (red) over the urn’s lip (blue) in the left camera, 0.2 mm off before it descends.' }], title: 'Align by camera', img: 'prog/bandu_align.jpg', vid: 'vid/prog/bandu_align.mp4', poster: 'vid/prog/bandu_align.jpg',
        text: 'The knob is aligned over the urn’s opening from both exterior cameras, to 0.19 mm, before it descends.', branch: 'One of three ways to seat a piece.' },
      { phase: 'main', viz: [{ img: 'viz/bandu_checks.png', cap: 'After each piece, which pieces it sees in place on the tower, from both cameras’ points.' }], title: 'Verify the tower', img: 'prog/bandu_verify.jpg', vid: 'vid/prog/bandu_verify.mp4', poster: 'vid/prog/bandu_verify.jpg',
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
    { viz: [{ img: 'viz/rby1_map.png', cap: 'Its scene model of the room and the base routes it planned for each stage.' }], title: 'Park the chair', time: '19:41', img: 'rby1/s1_park.jpg', vid: 'vid/rby1/s1.mp4', poster: 'vid/rby1/s1.jpg', skills: ['chair'],
      code: ['chair.measure()', 'chair.grasp()', 'route([pull(.5), turn(1.42),', '       drive(1.45), turn(-1.57)])', 'chair.release()'] },
    { viz: [{ img: 'viz/rby1_cups.png', cap: 'The two cups located from Gemini’s rim points and the head camera’s depth.' }, { img: 'viz/rby1_align.jpg', cap: 'Lining up the held cup over the other before inserting it.' }], title: 'Stack the cups', time: '20:04', img: 'rby1/s2_cups.jpg', vid: 'vid/rby1/s2.mp4', poster: 'vid/rby1/s2.jpg', skills: ['cups'],
      code: ['cups.scan("silver cup at the back left",', '          "silver cup in the front next to the banana")', 'cups.pick(front, "left")', 'cups.align(back, "left", dx=.022, dy=.014)', 'cups.insert("left")'] },
    { title: 'Cups and banana into the bucket', time: '20:20', img: 'rby1/s3_bucket.jpg', vid: 'vid/rby1/s3.mp4', poster: 'vid/rby1/s3.jpg', skills: ['cups'],
      code: ['# stack: staged pick on cups code', 'cups.locate("silver cup")', 'pick_staged("right", depth=.04)', '# banana: new, on cups grasp code', 'banana_pick(mid, tangent, "left")', 'torso("ready")  # stand up', 'drop("right"); drop("left")'] },
    { title: 'Bucket onto the cabinet', time: '20:39', img: 'rby1/s4_cabinet.jpg', vid: 'vid/rby1/s4.mp4', poster: 'vid/rby1/s4.jpg', skills: ['bucket'],
      code: ['bucket.run(stop="find_bucket")', 'bucket.run("final_approach", stop="pregrasp")', 'bucket.run("grasp_lift")', 'world["cabinet"] = own_depth()', 'bucket.run("lower_to_touch")', 'bucket.run("release")'] },
    { viz: [{ img: 'viz/rby1_picks.jpg', cap: 'Points it picked on the desk edge in the head image, and the edge it fitted, to centre before the tuck.' }], title: 'Tuck the chair', time: '20:54', img: 'rby1/s5_tuck.jpg', vid: 'vid/rby1/s5.mp4', poster: 'vid/rby1/s5.jpg', skills: ['chair'],
      code: ['chair.measure()  # twice', 'chair.grasp()', 'route([pull(.6), turn(-1.73),', '       drive(1.52), turn(1.57)])', 'route([turn(.48), drive(.27), turn(-.39)])', 'chair.tuck(1.49, 0.551)', 'chair.release()'] },
    { title: 'Box onto the cabinet', time: '21:09', img: 'rby1/s6_box.jpg', vid: 'vid/rby1/s6.mp4', poster: 'vid/rby1/s6.jpg', skills: ['box'],
      code: ['box.run(stop="plan_approach")', 'box.run("drive_approach", stop="check_stance")', 'box.run("grasp", stop="lift")', 'edge_x = own_depth()  # 0.59', 'box.run("approach_table", edge_x=0.59)', 'box.run("place")'] }
  ]
};

// The real-robot tasks, in the order of the session tabs (text as on the original page).
RAX.sessionTasks = [
  { key: 'cube', video: 'find_the_cube', name: 'Find the Cube', meta: 'Franka · memory · 2 h 35 min session', length: '2 h 35 min',
    desc: 'The operator hides a cube under one of four cups, at one point dropping it into a cup, and shuffles them. The agent learns to watch the shuffle from above, to follow the cube by its shape and height in depth rather than by its appearance, and to lift the right cup and pick up the cube.' },
  { key: 'airfry', video: 'air_fry_pan', name: 'Air Fryer', meta: 'Franka · articulated object · 2 h 46 min session', length: '2 h 46 min',
    desc: 'Open a heavy air-fryer drawer, put a banana (and later a ball) inside, and close it. The agent searches for a collision-free grasp on the handle, works out how far to pull and how to drop the banana, and turns the routine into a program that runs unattended.' },
  { key: 'wipe', video: 'swipe_table', name: 'Wipe the Table', meta: 'Franka · deformable object · 3 h 25 min session', length: '3 h 25 min',
    desc: 'Wipe a soy-sauce stain with a wet towel, on an arm without a force sensor. The agent learns to grab a thick wad of cloth, to infer contact from where the cloth stalls the arm, and to check with its cameras that the table is really clean.' },
  { key: 'peg', video: 'peg_insertion', name: 'Peg-in-Hole', meta: 'Franka · precision · ManipulationNet board · 4 h 39 min session', length: '4 h 39 min',
    desc: 'The ManipulationNet peg-in-hole board, with rows of 3 mm, 1 mm and 0.1 mm clearance. The agent registers the board to its CAD model, finds holes by touch, and develops a wiggle-push that seats all three pegs in the 0.1 mm-clearance row.' },
  { key: 'bandu', video: 'bandu', name: 'Bandu Tower', meta: 'Franka · precision stacking · 6 h 6 min session', length: '6 h 6 min',
    desc: 'Rebuild a tower of seven irregular wooden blocks, with the finished tower as the only demonstration. The agent measures each piece by touch while taking the tower apart, then writes a program that takes the tower apart and rebuilds it on its own.' },
  { key: 'rby1', video: 'rby1', name: 'RB-Y1: Six Chained Tasks', meta: 'Rainbow RB-Y1 · long-horizon, whole body · three runs', length: 'three runs',
    desc: 'One instruction, six steps across a room: park a chair, stack two cups, put the cups and a banana in a bucket, set the bucket on a cabinet, tuck the chair back, and place a box. The agent reuses skills it taught itself in earlier sessions and refines them after every run: 120, 117 and 98 minutes over three runs.' }
];
