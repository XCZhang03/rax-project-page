// Session chapters: clips from the raw camera recordings, with what each shows.
RAX.sessions = {
 "cube": {
  "chapters": [
   {
    "title": "The first shuffle",
    "when": "20:08",
    "status": "explore",
    "text": "The operator hides the cube and shuffles the cups before the arm has reached its watch pose. Replaying the recording, the agent finds that the side-camera tracker lost the cups where they crossed.",
    "quote": "The cube is gone. The operator shuffled while I was still moving into place, so I’ll replay the recording to see what happened.",
    "vid": "assets/vid/sess/cube_01.mp4",
    "poster": "assets/vid/sess/cube_01.jpg"
   },
   {
    "title": "Watching from above",
    "when": "20:16",
    "status": "explore",
    "text": "The agent moves the wrist camera over the cups and asks for the game again. Its tracker picks the right cup, but the scripted grasps miss, so it finishes the cup removal and the cube grasp with direct commands.",
    "quote": "New plan: watch the shuffle from directly above with the wrist camera, and ask the operator to do it again.",
    "vid": "assets/vid/sess/cube_02.mp4",
    "poster": "assets/vid/sess/cube_02.jpg"
   },
   {
    "title": "A decoy cup",
    "when": "20:45",
    "status": "fix",
    "text": "The operator moves the cube and leaves a decoy cup on its old spot. The controller, which assumed the cube stays put, picks the decoy; the agent rewrites identification to follow the cube by its shape and height in depth, checks it on the recording, and completes the pick.",
    "quote": "Template matching breaks once the cube moves. I’ll use depth instead and follow the cube’s shape and height above the table.",
    "vid": "assets/vid/sess/cube_03.mp4",
    "poster": "assets/vid/sess/cube_03.jpg"
   },
   {
    "title": "First fully autonomous run",
    "when": "21:05",
    "status": "success",
    "text": "The tracker follows the cup as it slides away with the cube inside, and the program lifts that cup and picks up the cube: 166 s end to end, no intervention. The next two runs also succeed on their own, in 231 s and 194 s.",
    "vid": "assets/vid/sess/cube_04.mp4",
    "poster": "assets/vid/sess/cube_04.jpg"
   },
   {
    "title": "A missed cover",
    "when": "21:19",
    "status": "fix",
    "text": "The program misses the moment the cup covers the cube and stops without moving. The agent widens the cover distance, checks that all six saved shuffles still replay correctly, and resumes the same scene.",
    "vid": "assets/vid/sess/cube_05.mp4",
    "poster": "assets/vid/sess/cube_05.jpg"
   },
   {
    "title": "Cube pinched through the cup",
    "when": "21:27",
    "status": "fix",
    "text": "The right cup, but the gripper squeezes the cube through the cup wall and carries both away. The agent now grips cups 1.2 cm below the top at 8 N, which lifts the cup alone.",
    "quote": "you grasped them together",
    "vid": "assets/vid/sess/cube_06.mp4",
    "poster": "assets/vid/sess/cube_06.jpg"
   },
   {
    "title": "A new way of hiding",
    "when": "21:35",
    "status": "fix",
    "text": "The operator drops the cube into an upright cup and turns it over. The program sees no hiding event it knows and stops; the agent adds a detector for a cube inside a cup, checks it on all seven recordings, and the robot then lifts the right cup and grasps the cube.",
    "quote": "A new hiding trick: the cube was dropped into an upright cup. I need a detector for the cube inside a cup’s opening.",
    "vid": "assets/vid/sess/cube_07.mp4",
    "poster": "assets/vid/sess/cube_07.jpg"
   },
   {
    "title": "A red wedge",
    "when": "22:24",
    "status": "success",
    "text": "The operator swaps the cube for a red wedge and hides it the same way. The agent keeps the cup tracker, generalizes its object model to a measured size, colour and height, and grasps the wedge on the first try.",
    "vid": "assets/vid/sess/cube_08.mp4",
    "poster": "assets/vid/sess/cube_08.jpg"
   }
  ]
 },
 "airfry": {
  "chapters": [
   {
    "title": "Scouting",
    "when": "09:33",
    "status": "explore",
    "text": "Before touching anything, the agent looks at the fryer and the banana in its camera point clouds and models the Γ-shaped handle. It rules out a front grasp, whose joint margins are poor, and settles on a grasp of the handle arm 5° off vertical.",
    "vid": "assets/vid/sess/airfry_01.mp4",
    "poster": "assets/vid/sess/airfry_01.jpg"
   },
   {
    "title": "First success, step by step",
    "when": "10:04",
    "status": "success",
    "text": "The agent drives the arm call by call: it grasps the handle at 50 N, pulls the drawer 12.6 cm in small steps, drops the banana from a hand tilted 60°, and closes the drawer with a final fingertip push.",
    "vid": "assets/vid/sess/airfry_02.mp4",
    "poster": "assets/vid/sess/airfry_02.jpg"
   },
   {
    "title": "Elbow into the camera",
    "when": "10:44",
    "status": "fail",
    "text": "The first run of its controller opens the drawer, but the planner picks a flipped-elbow posture for the banana and the elbow hits the left camera. The arm is stopped, and the right camera is knocked out of place for good.",
    "vid": "assets/vid/sess/airfry_03.mp4",
    "poster": "assets/vid/sess/airfry_03.jpg"
   },
   {
    "title": "Recovered and closing",
    "when": "11:13",
    "status": "fix",
    "text": "The agent re-registers the bumped left camera, stops using the right one, and allows only natural arm postures clear of both cameras. Its controller then closes the drawer left open in the crash with four friction pushes and a fingertip push.",
    "vid": "assets/vid/sess/airfry_04.mp4",
    "poster": "assets/vid/sess/airfry_04.jpg"
   },
   {
    "title": "Fully unattended",
    "when": "11:26",
    "status": "success",
    "text": "Open, banana in, close: 171 s with no one stepping in. The agent still checks the closed drawer against its reference images.",
    "vid": "assets/vid/sess/airfry_05.mp4",
    "poster": "assets/vid/sess/airfry_05.jpg"
   },
   {
    "title": "Fryer turned toward the robot",
    "when": "11:39",
    "status": "fix",
    "text": "With the fryer rotated, a long carry exceeds the per-call move limit and a wrist path runs near a singularity. The agent recovers by hand, then splits long moves and plans that approach in joint space; the next run on the same layout succeeds unattended in 178 s.",
    "vid": "assets/vid/sess/airfry_06.mp4",
    "poster": "assets/vid/sess/airfry_06.jpg"
   },
   {
    "title": "Banana and ball",
    "when": "12:00",
    "status": "success",
    "text": "For the final run the operator adds an orange ball, and moves the banana away from the bumped camera at the agent’s request. The program opens the drawer 13.1 cm, drops in the banana and then the ball, and closes it: 210 s, unattended.",
    "vid": "assets/vid/sess/airfry_07.mp4",
    "poster": "assets/vid/sess/airfry_07.jpg"
   }
  ]
 },
 "wipe": {
  "chapters": [
   {
    "title": "Learning to hold a wet towel",
    "when": "09:28",
    "status": "explore",
    "text": "A light pinch slips off the flat towel. Pressing the fingertips into the cloth before closing lifts it, and a thick wad from the heap makes a good wiping pad.",
    "vid": "assets/vid/sess/wipe_01.mp4",
    "poster": "assets/vid/sess/wipe_01.jpg"
   },
   {
    "title": "Trial 0: wiping by hand",
    "when": "09:38",
    "status": "explore",
    "text": "Through tool calls, the agent lowers the towel onto the stain and scrubs. The first pass smears the sauce into a thin film; after the operator adds soap, a second pass leaves the table clean.",
    "vid": "assets/vid/sess/wipe_02.mp4",
    "poster": "assets/vid/sess/wipe_02.jpg"
   },
   {
    "title": "A false “clean”",
    "when": "10:11",
    "status": "fix",
    "text": "The controller declared the table clean after one pass, but thin streaks remained and the operator asked for a second wipe. The agent added a wrist-camera check at 1 mm resolution, and a second pass cleared the streaks.",
    "vid": "assets/vid/sess/wipe_03.mp4",
    "poster": "assets/vid/sess/wipe_03.jpg"
   },
   {
    "title": "A stain next to the camera",
    "when": "10:42",
    "status": "fix",
    "text": "A 311 cm² smear ran up to the left camera. The controller fits the wiping region to what the arm can reach while keeping clear of the camera, and finishes the last corner in follow-up passes.",
    "vid": "assets/vid/sess/wipe_04.mp4",
    "poster": "assets/vid/sess/wipe_04.jpg"
   },
   {
    "title": "Trial 6: one pass, unattended",
    "when": "10:54",
    "status": "success",
    "text": "The operator pours a 291 cm² smear; the program grasps a wad of towel, scrubs and checks. The table is clean after one pass, with 0 cm² of residue in the exterior and wrist cameras.",
    "vid": "assets/vid/sess/wipe_05.mp4",
    "poster": "assets/vid/sess/wipe_05.jpg"
   },
   {
    "title": "Trial 7b: next to the robot base",
    "when": "11:06",
    "status": "success",
    "text": "In trial 7 the approach to the towel was refused near the robot’s base. The agent switched to a joint-space approach, and trial 7b cleaned the same stain in one pass.",
    "vid": "assets/vid/sess/wipe_06.mp4",
    "poster": "assets/vid/sess/wipe_06.jpg"
   },
   {
    "title": "A new task: paper towels",
    "when": "11:36",
    "status": "explore",
    "text": "The operator asks for paper towels pulled from a box, a wipe, and the towels thrown into the bin. The new program reuses the towel program’s parts, and dry runs test the paper handling.",
    "vid": "assets/vid/sess/wipe_07.mp4",
    "poster": "assets/vid/sess/wipe_07.jpg"
   },
   {
    "title": "Paper towels on a real stain",
    "when": "11:42",
    "status": "success",
    "text": "The program piles six sheets on a 46 cm² pour, scrubs the stain off in one pass, and drops the wad in the bin. Sheets left on the table were cleared by a supervised script.",
    "vid": "assets/vid/sess/wipe_08.mp4",
    "poster": "assets/vid/sess/wipe_08.jpg"
   }
  ]
 },
 "peg": {
  "chapters": [
   {
    "title": "Finding the board by touch",
    "when": "22:59",
    "status": "explore",
    "text": "The cameras disagree by about a centimetre on where the transparent board is, so the agent lowers the closed gripper until it feels contact. The table tilts 3.4 mm per 10 cm, and the board top sits 24.7 mm above it.",
    "vid": "assets/vid/sess/peg_01.mp4",
    "poster": "assets/vid/sess/peg_01.jpg"
   },
   {
    "title": "Row L1, 3 mm clearance",
    "when": "23:16",
    "status": "success",
    "text": "The hexagon and the triangle drop straight in. The rectangle needs a 56-step sliding spiral search, which drags the board about 5 mm.",
    "vid": "assets/vid/sess/peg_02.mp4",
    "poster": "assets/vid/sess/peg_02.jpg"
   },
   {
    "title": "The loose hole as a ruler",
    "when": "00:22",
    "status": "fix",
    "text": "After about 25 minutes of blind searches for the 1 mm row, the agent centres the peg against the walls of the loose L1 hole and shifts it by the CAD offset. The hexagon drops straight into L2.",
    "vid": "assets/vid/sess/peg_03.mp4",
    "poster": "assets/vid/sess/peg_03.jpg"
   },
   {
    "title": "Correcting the camera",
    "when": "00:43",
    "status": "fix",
    "text": "The triangle and the hexagon reveal the same wrist-camera error, (+6.4, −0.8) mm. With it corrected, the rectangle enters L2 on the first probe, completing the row.",
    "vid": "assets/vid/sess/peg_04.mp4",
    "poster": "assets/vid/sess/peg_04.jpg"
   },
   {
    "title": "Wiggle-push into 0.1 mm",
    "when": "01:10",
    "status": "success",
    "text": "At a 4° tilt the triangle jammed 6 to 9 mm into the L3 hole. With a 6° tilted entry and ±0.7° rocking while pushing at up to 10 N, it seats 19.9 mm deep.",
    "vid": "assets/vid/sess/peg_05.mp4",
    "poster": "assets/vid/sess/peg_05.jpg"
   },
   {
    "title": "Board taped, hexagon retried",
    "when": "01:33",
    "status": "fix",
    "text": "Lifting a jammed peg had dragged the board, so the agent asked the operator to tape it down and registered it again. With a 55 N grasp and a 1.8 mm corner margin, the hexagon seats in L3 at 19.3 mm.",
    "vid": "assets/vid/sess/peg_06.mp4",
    "poster": "assets/vid/sess/peg_06.jpg"
   },
   {
    "title": "Corner-entry search: all three in L3",
    "when": "01:45",
    "status": "success",
    "text": "The rectangle’s corner rests on the rim, so the agent searches along x in 1 mm steps; it drops in at +1 mm and seats at 19.0 mm. All three pegs are now in the 0.1 mm row.",
    "vid": "assets/vid/sess/peg_07.mp4",
    "poster": "assets/vid/sess/peg_07.jpg"
   },
   {
    "title": "The full run, L1 → L2 → L3",
    "when": "02:28",
    "status": "success",
    "text": "Starting from the table, each peg goes into L1, then L2, then L3, shown upright in every row. Final depths in L3: hexagon 20.8 mm, triangle 19.7 mm, rectangle 21.0 mm.",
    "vid": "assets/vid/sess/peg_08.mp4",
    "poster": "assets/vid/sess/peg_08.jpg"
   }
  ]
 },
 "bandu": {
  "chapters": [
   {
    "title": "Measuring the tower by touch",
    "when": "11:26",
    "status": "explore",
    "text": "The only demonstration is the finished tower. Close-up images are too blurry to size the pieces, so the agent takes the tower apart one piece at a time, and grasp widths and touch-downs give each piece's size and seat height.",
    "quote": "Measure by touch while taking the tower apart: tap the table first to calibrate.",
    "vid": "assets/vid/sess/bandu_01.mp4",
    "poster": "assets/vid/sess/bandu_01.jpg"
   },
   {
    "title": "Repairing the base itself",
    "when": "12:01",
    "status": "fix",
    "text": "Its collisions knocked the four-block base apart. Told to fix it itself, the agent pushes the blocks back into place, and plans take-apart and rebuild cycles so that no human reset is needed.",
    "quote": "try fix it yourself",
    "vid": "assets/vid/sess/bandu_02.mp4",
    "poster": "assets/vid/sess/bandu_02.jpg"
   },
   {
    "title": "Rebuilt by its own commands",
    "when": "12:48",
    "status": "success",
    "text": "Driving the arm with its own step scripts, the agent rebuilds the tower to match the demonstration; the dowel needs a tactile search 5 mm off.",
    "vid": "assets/vid/sess/bandu_03.mp4",
    "poster": "assets/vid/sess/bandu_03.jpg"
   },
   {
    "title": "First program run",
    "when": "13:08",
    "status": "success",
    "text": "It turns the sequence into a program with take-apart and assemble modes. Run 1 moves all six pieces off the base and verifies that the base is empty.",
    "vid": "assets/vid/sess/bandu_04.mp4",
    "poster": "assets/vid/sess/bandu_04.jpg"
   },
   {
    "title": "The knob will not go in",
    "when": "14:16",
    "status": "fail",
    "text": "Assembly now places six of seven pieces, including a tilted cylinder the operator added, but the knob's probes never find the urn's mouth. The operator asks for visual calibration instead of a contact search.",
    "vid": "assets/vid/sess/bandu_05.mp4",
    "poster": "assets/vid/sess/bandu_05.jpg"
   },
   {
    "title": "Aligning the knob by camera",
    "when": "16:15",
    "status": "fix",
    "text": "The agent measures the knob's foot against the urn's lip in both exterior cameras, untilts the hand from 7.8° to 0.8°, and seats the knob. All seven pieces are on the tower.",
    "quote": "align with at most 1 mm opening error",
    "vid": "assets/vid/sess/bandu_06.mp4",
    "poster": "assets/vid/sess/bandu_06.jpg"
   },
   {
    "title": "Practice cycle 1",
    "when": "16:19",
    "status": "fix",
    "text": "The program takes all seven pieces off on its own. While rebuilding, it accepts an urn caught 24° on the goblet rim, so the agent adds an upright check in both cameras.",
    "vid": "assets/vid/sess/bandu_07.mp4",
    "poster": "assets/vid/sess/bandu_07.jpg"
   },
   {
    "title": "Fully automatic rebuild",
    "when": "17:07",
    "status": "success",
    "text": "Cycle 2 runs with no intervention: seven of seven pieces in 663 s, with the knob aligned by camera and seated 0.2 mm below its seat.",
    "vid": "assets/vid/sess/bandu_08.mp4",
    "poster": "assets/vid/sess/bandu_08.jpg"
   }
  ]
 },
 "rby1": {
  "chapters": [
   {
    "title": "Practising the chair skill",
    "when": "9 Oct, 16:43",
    "status": "explore",
    "text": "In an earlier practice session the agent pulls an office chair out by its backrest bar with both grippers, turns and drives it, and pushes it back in; from what worked it writes the office-chair-tuck skill.",
    "vid": "assets/vid/sess/rby1_01.mp4",
    "poster": "assets/vid/sess/rby1_01.jpg"
   },
   {
    "title": "Run 1: the chair slips in a turn",
    "when": "21:37",
    "status": "fix",
    "text": "Run 1 starts with the stored chair skill. A turn loses the chair, so the agent re-grasps 4 cm deeper with both hands, parks the chair left of the desk, and keeps the deeper grasp in the skill.",
    "quote": "be deeper",
    "vid": "assets/vid/sess/rby1_02.mp4",
    "poster": "assets/vid/sess/rby1_02.jpg"
   },
   {
    "title": "Run 1: standing up to lift",
    "when": "22:18",
    "status": "fix",
    "text": "Pinching the bucket rim while squatting overloads a wrist and the torque stop triggers. On the operator's prompt the agent stands up first, the wrist load drops to 55 %, and standing up before the lift becomes a rule in the skill.",
    "quote": "stand up fast to relieve",
    "vid": "assets/vid/sess/rby1_03.mp4",
    "poster": "assets/vid/sess/rby1_03.jpg"
   },
   {
    "title": "Run 1: the base hits the cabinet",
    "when": "22:24",
    "status": "fail",
    "text": "A 151° turn the agent planned by hand swings the rear of the base into the cabinet and pushes it 0.2 to 0.3 m, with the bucket still upright on top. From then on every base move is checked against the area the base sweeps.",
    "quote": "you crashed into the cabinet with the back of the base",
    "vid": "assets/vid/sess/rby1_04.mp4",
    "poster": "assets/vid/sess/rby1_04.jpg"
   },
   {
    "title": "A new skill between runs",
    "when": "23:30",
    "status": "explore",
    "text": "Between runs the agent writes oc-hand-reach, a skill for whole-body hand moves, tests it in free air, and merges it into the library with the updated chair, cups and bucket skills.",
    "vid": "assets/vid/sess/rby1_05.mp4",
    "poster": "assets/vid/sess/rby1_05.jpg"
   },
   {
    "title": "Run 2: all six stages again",
    "when": "01:30",
    "status": "success",
    "text": "With the merged library, run 2 completes all six stages; here the box skill carries the box onto the cabinet.",
    "vid": "assets/vid/sess/rby1_06.mp4",
    "poster": "assets/vid/sess/rby1_06.jpg"
   },
   {
    "title": "Run 3: the cabinet edge from depth",
    "when": "20:38",
    "status": "success",
    "text": "In the final run the bucket hides the cabinet edge from the skill's approach, so the agent reads the edge from pixel depth, lowers the bucket until it touches, and releases it. Run 3 completes all six stages in 98 minutes.",
    "vid": "assets/vid/sess/rby1_07.mp4",
    "poster": "assets/vid/sess/rby1_07.jpg"
   }
  ]
 }
};
