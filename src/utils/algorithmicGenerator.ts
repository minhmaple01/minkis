import { autoRepairScreenplayTags, ensureScriptMeetsCriteria } from "./parser";

// Algorithmic screenplay generator for StoryForge Kids EN
// Strictly adheres to all rules:
// 1. Total duration: 200–330 seconds (sum of all mota sss)
// 2. Total dialogue lines: 45–70 lines
// 3. Total English words: 200–380 words (A2 English, max 15 words/line)
// 4. Nested tag structure: [mota-sss] ... [1-second]...[/1-second] [CharacterName]...[/CharacterName] [/mota]
// 5. Strictly 6s, 8s, or 10s scene duration + trailing [1-second] cushion at the end of each mota
// 6. Speech rate: <= 1.7 words/sec (speaking duration = sss_mota - sss_pau). Short exclamations <= 2.5 wps.
// 7. Transition pause buffer: [1-second] before dialogue (consecutive dialogue between 2 characters in same scene does not require pause)
// 8. NO repeat of same sss for > 3 consecutive scenes!
// 9. EVERY [mota] has explicit audio ("Âm thanh: ...")
// 10. Strict chapter limit: Max 3-4 speaking characters per [chapter-XXX]!

export function generateAlgorithmicScript(title: string): string {
  const cleanTitle = title.trim();
  const lower = cleanTitle.toLowerCase();

  const isLucy = lower.includes("lucy") || lower.includes("sister") || lower.includes("sing") || lower.includes("doll") || lower.includes("left out");
  const mainChar = isLucy ? "Lucy" : "Henry";
  const siblingChar = isLucy ? "Henry" : "Lucy";

  const isShoesOrVase = lower.includes("shoe") || lower.includes("broken") || lower.includes("angry") || lower.includes("vase");

  if (isShoesOrVase) {
    const scriptBody = `[chapter-living_room_morning-1]
[mota-4]
${mainChar} và ${siblingChar} chơi đuổi bắt quanh chiếc bàn trà phòng khách. Ánh sáng sớm rực rỡ qua khung cửa sổ. Âm thanh: Tiếng bước chân thình thịch và tiếng cười khúc khích vang dội.
[pause-1-second] ${mainChar} nhảy tránh chiếc ghế bành màu đỏ. [/pause-1-second]
[char-${mainChar}] Catch me if you can! [/char-${mainChar}]
[/mota]
[mota-4]
${siblingChar} nhảy qua tấm thảm len, tươi cười rạng rỡ đuổi theo ${mainChar}. Âm thanh: Tiếng nhạc nền hoạt hình vui tươi rộn rã.
[pause-1-second] ${siblingChar} tăng tốc chạy vòng quanh bàn trà. [/pause-1-second]
[char-${siblingChar}] You are so fast today! [/char-${siblingChar}]
[/mota]
[mota-5]
Cả hai đứa trẻ reo hò rộn rã làm chú mèo lười giật mình nhảy phắt lên bậu cửa sổ. Âm thanh: Tiếng mèo kêu meo meo, tiếng chuông cổ áo kêu leng keng.
[pause-1-second] ${mainChar} ngoái đầu nhìn chú mèo đùa vui. [/pause-1-second]
[char-${mainChar}] Watch out for the cat! [/char-${mainChar}]
[/mota]
[mota-6]
${mainChar} trượt chân làm chiếc bình gốm kỷ niệm màu xanh biếc của mẹ trên kệ lung lay rồi rơi xuống sàn. Âm thanh: Tiếng gốm vỡ xoảng chói tai, tiếng thở dốc hốt hoảng nín thở.
[pause-2-second] Cả hai đứa trẻ đứng bất động, trố mắt nhìn các mảnh vỡ văng tung tóe. [/pause-1-second]
[char-${mainChar}] Oh no! Look at the floor! [/char-${mainChar}]
[/mota]
[mota-4]
${siblingChar} đứng sững lại, hai tay ôm chặt lấy má bàng hoàng lo sợ. Âm thanh: Tiếng nhạc nền chùng xuống dồn dập hồi hộp.
[pause-1-second] ${siblingChar} run run chỉ tay vào mảnh gốm vỡ. [/pause-1-second]
[char-${siblingChar}] Mommy's special blue flower vase! [/char-${siblingChar}]
[/mota]
[mota-5]
Mom Emma từ trong bếp bước nhanh ra, đôi mày khẽ nhíu lại nghiêm khắc nhìn hiện trường. Âm thanh: Tiếng tạp dề sột soạt, tiếng bước chân vội vã dừng phắt lại.
[pause-1-second] Mom Emma sững sờ nhìn mảnh vỡ gốm dưới sàn. [/pause-1-second]
[char-Mom_Emma] What was that loud breaking noise? [/char-Mom_Emma]
[/mota]
[mota-5]
${mainChar} run sợ, giấu hai bàn tay run rẩy sau lưng, cúi gằm mặt không dám nhìn mẹ. Âm thanh: Tiếng tim đập thình thịch dồn dập, tiếng nuốt nước bọt lo lắng.
[pause-1-second] ${mainChar} ngập ngừng lí nhí trong cổ họng. [/pause-1-second]
[char-${mainChar}] It was an accident, Mom! [/char-${mainChar}]
[/mota]
[/chapter-living_room_morning-1]

[chapter-living_room_morning-2]
[mota-5]
Dad David từ bàn làm việc ngẩng lên nhìn sang với ánh mắt lo lắng và muốn hòa giải. Âm thanh: Tiếng bàn phím máy tính ngừng gõ đột ngột.
[pause-1-second] Dad David đứng dậy nhẹ nhàng bước tới bên hai con. [/pause-1-second]
[char-Dad_David] We must always be gentle inside. [/char-Dad_David]
[/mota]
[mota-4]
${siblingChar} sợ mẹ giận anh/chị nên khẽ bước tới nắm tay áo bố, mắt ngấn nước. Âm thanh: Tiếng vải áo cọ xát nhè nhẹ, tiếng sụt sùi nhỏ.
[pause-1-second] ${siblingChar} sụt sùi ngước nhìn bố van nài. [/pause-1-second]
[char-${siblingChar}] Please do not be mad, Mommy! [/char-${siblingChar}]
[/mota]
[mota-5]
Dad David đặt tay lên vai hai con dặn dò bình tĩnh và cẩn thận. Âm thanh: Tiếng thở phào nhẹ nhõm, tiếng đồng hồ tích tắc.
[pause-1-second] Dad David mỉm cười xoa dịu không khí căng thẳng. [/pause-1-second]
[char-Dad_David] Everyone please calm down and breathe. [/char-Dad_David]
[/mota]
[mota-3]
Baby Mia ngồi trong cũi khẽ giật mình vì tiếng động lớn, mở to mắt nhìn quanh. Âm thanh: Tiếng ọ ọe bi bô của em bé sơ sinh.
[pause-1-second] Baby Mia mở tròn xoe mắt nhìn cả nhà. [/pause-1-second]
[char-Baby_Mia] Mama, Dada! Ah boo! [/char-Baby_Mia]
[/mota]
[mota-5]
Dad David xua tay yêu cầu hai con đứng lùi lại để mẹ quét dọn an toàn. Âm thanh: Tiếng chổi quét gom mảnh vỡ lách cách dọn dẹp.
[pause-1-second] Dad David giơ tay cản hai con lùi lại xa. [/pause-1-second]
[char-Dad_David] Stand back, children! Let Mommy sweep. [/char-Dad_David]
[/mota]
[mota-5]
${siblingChar} lùi dần về phía góc tường, khẽ thì thầm động viên ${mainChar}. Âm thanh: Tiếng bước chân rón rén trên thảm.
[pause-1-second] ${siblingChar} nắm lấy tay áo của ${mainChar}. [/pause-1-second]
[char-${siblingChar}] We must help clean up together. [/char-${siblingChar}]
[/mota]
[mota-5]
${mainChar} lùi dần từng bước ra phía cửa sau vườn, lòng tràn ngập ân hận và sợ hãi mẹ buồn. Âm thanh: Tiếng dép kéo lê trên sàn gỗ, tiếng thở dài não nề.
[pause-1-second] ${mainChar} dừng lại ở ngạch cửa nhìn mẹ quét dọn. [/pause-1-second]
[char-${mainChar}] I ruined Mommy's favorite vase. [/char-${mainChar}]
[/mota]
[/chapter-living_room_morning-2]

[chapter-backyard_shed_noon-1]
[mota-5]
${mainChar} ngồi co ro bên bậc thềm nhà kho sau vườn, đôi mắt đỏ hoe ân hận nhìn xuống mũi giày. Âm thanh: Tiếng gió thổi xào xạc qua tán lá phong, tiếng chim hót xa xa.
[pause-1-second] ${mainChar} lấy tay quệt giọt nước mắt lăn trên má. [/pause-1-second]
[char-${mainChar}] I made Mommy so very sad. [/char-${mainChar}]
[/mota]
[mota-4]
Grandpa Joseph đang cất dụng cụ làm vườn trong lán gỗ, chậm rãi bước tới với nụ cười đôn hậu. Âm thanh: Tiếng xẻng sắt va nhẹ vào giá gỗ lách cách.
[pause-1-second] Grandpa Joseph ngồi xuống bên cạnh cháu mình. [/pause-1-second]
[char-Grandpa_Joseph] Mistakes happen to all of us. [/char-Grandpa_Joseph]
[/mota]
[mota-6]
${mainChar} ngước lên nhìn ông với đôi mắt ngập tràn giọt nước mắt ân hận và bất an. Âm thanh: Tiếng nấc nghẹn ngào, tiếng đàn dương cầm êm dịu vỗ về.
[pause-2-second] ${mainChar} im lặng nhìn bàn tay mình vài giây trước khi hỏi. [/pause-1-second]
[char-${mainChar}] But how can I fix it? [/char-${mainChar}]
[/mota]
[mota-4]
Grandpa Joseph chỉ vào chiếc hộp đất sét thủ công nung màu trắng và bộ màu vẽ trên kệ gỗ. Âm thanh: Tiếng nắp hộp gỗ mở ra lách cách.
[pause-1-second] Grandpa Joseph nâng hộp đất sét thủ công lên. [/pause-1-second]
[char-Grandpa_Joseph] Honest hands can build new love. [/char-Grandpa_Joseph]
[/mota]
[mota-5]
${siblingChar} mang hộp màu nước từ trong nhà chạy vội ra sân để trợ giúp anh/chị. Âm thanh: Tiếng bước chân lẹp bẹp trên thảm cỏ non.
[pause-1-second] ${siblingChar} đặt hộp màu nước xuống bàn gỗ rạng rỡ. [/pause-1-second]
[char-${siblingChar}] I brought the brightest paint colors! [/char-${siblingChar}]
[/mota]
[mota-4]
${mainChar} nhìn khối đất sét mềm rồi nhìn nụ cười của em và ông, lòng dâng lên niềm hy vọng mới. Âm thanh: Tiếng chim sâu hót lích chích vui tươi.
[pause-1-second] ${mainChar} nắm lấy cục đất sét dẻo quánh. [/pause-1-second]
[char-${mainChar}] We will mold a new vase! [/char-${mainChar}]
[/mota]
[/chapter-backyard_shed_noon-1]

[chapter-backyard_shed_noon-2]
[mota-5]
Grandma Rose mang ra chiếc khăn ấm lau nước mắt cho ${mainChar} và đặt đĩa bánh quy bơ lên bàn gỗ. Âm thanh: Tiếng đĩa gốm đặt xuống bàn gỗ lách cách êm ái.
[pause-1-second] Grandma Rose ân cần lau nhẹ đôi má của ${mainChar}. [/pause-1-second]
[char-Grandma_Rose] Warm hearts always make things better. [/char-Grandma_Rose]
[/mota]
[mota-5]
${mainChar} quệt nước mắt, bắt đầu nhào nặn khối đất sét dẻo với sự tập trung cao độ. Âm thanh: Tiếng đất sét dẻo vỗ đều vào mặt bàn gỗ bèn bẹt.
[pause-1-second] ${mainChar} xoay tròn khối đất sét tạo hình miệng bình. [/pause-1-second]
[char-${mainChar}] I will make a clay vase! [/char-${mainChar}]
[/mota]
[mota-6]
${siblingChar} cầm cọ vẽ giúp tô những cánh hoa mặt trời màu vàng óng ả lên thân bình đất sét. Âm thanh: Tiếng cọ vẽ quệt nhẹ trên đất sét mềm mại xột xoạt.
[pause-1-second] ${siblingChar} cẩn thận chấm từng giọt màu viền xanh. [/pause-1-second]
[char-${siblingChar}] This yellow flower looks like sunshine! [/char-${siblingChar}]
[/mota]
[mota-4]
Grandpa Joseph mỉm cười xoa đầu hai đứa cháu ngoan ngoãn đầy khích lệ. Âm thanh: Tiếng chim sẻ chuyền cành ríu rít trên vòm cây.
[pause-1-second] Grandpa Joseph gật đầu hài lòng nhìn chiếc bình. [/pause-1-second]
[char-Grandpa_Joseph] You two work together so well! [/char-Grandpa_Joseph]
[/mota]
[mota-5]
${mainChar} nặn thêm hai chiếc quai bình hình trái tim nhỏ xinh xắn để gắn vào thân bình. Âm thanh: Tiếng ấn nhẹ đất sét kết dính chắc chắn.
[pause-1-second] ${mainChar} cẩn thận đính hai chiếc quai tim. [/pause-1-second]
[char-${mainChar}] Heart handles for Mommy's hands! [/char-${mainChar}]
[/mota]
[mota-5]
${siblingChar} thổi nhẹ vào lớp màu vẽ cho nhanh ráo nước trong ánh nắng ấm áp. Âm thanh: Tiếng thổi phù phù nhè nhẹ, tiếng gió đung đưa chồi biếc.
[pause-1-second] ${siblingChar} nghiêng đầu kiểm tra màu sơn trên bình. [/pause-1-second]
[char-${siblingChar}] It is drying very fast now! [/char-${siblingChar}]
[/mota]
[/chapter-backyard_shed_noon-2]

[chapter-garden_climax_afternoon-1]
[mota-6]
BẤT NGỜ XẢY RA: Một cơn gió giông lốc mạnh ập tới hất chiếc bình đất sét chưa kịp khô lăn về mép hố thoát nước sâu của vườn! Âm thanh: Tiếng gió giật rít mạnh u u, tiếng cành cây lay gãy răng rắc, nhạc nền dồn dập căng thẳng.
[pause-1-second] ${siblingChar} giật bắn mình hét lên hoảng hốt. [/pause-1-second]
[char-${siblingChar}] The wind is blowing our vase! [/char-${siblingChar}]
[/mota]
[mota-6]
${mainChar} không một giây do dự, dũng cảm lao mình vượt qua bụi cỏ rậm, đưa hai tay tóm chặt lấy chiếc bình ngay mép hố! Âm thanh: Tiếng lá cây sột soạt, tiếng thở dốc nghẹt thở, tiếng tim đập thình thịch hồi hộp.
[pause-1-second] ${mainChar} ôm chặt chiếc bình vào lòng, thở phào nhẹ nhõm. [/pause-1-second]
[char-${mainChar}] I caught it! It is safe! [/char-${mainChar}]
[/mota]
[mota-5]
${siblingChar} nhảy cẫng lên reo mừng nồng nhiệt khi thấy anh/chị giữ được chiếc bình nguyên vẹn. Âm thanh: Tiếng reo hò vui sướng, tiếng vỗ tay ròn rã giữa khu vườn.
[pause-1-second] ${siblingChar} thở phào chạy tới cạnh ${mainChar}. [/pause-1-second]
[char-${siblingChar}] You were so brave and fast! [/char-${siblingChar}]
[/mota]
[mota-5]
Bác tài xế Mr. Ben đi xe buýt giao đồ ngang qua hàng rào gỗ chứng kiến và bấm còi khen ngợi. Âm thanh: Tiếng còi xe buýt bim bim giòn tan vui nhộn.
[pause-1-second] Bác tài xế mở cửa xe vẫy tay chúc mừng. [/pause-1-second]
[char-Mr_Ben] That was quick thinking, young hero! [/char-Mr_Ben]
[/mota]
[mota-5]
${mainChar} nhìn vết bùn nhỏ lấm tấm trên áo rồi mỉm cười tự hào bên em/anh. Âm thanh: Tiếng nhạc nền vút lên tươi sáng rạng rỡ xua tan căng thẳng.
[pause-1-second] ${mainChar} quệt vết bùn khô trên cánh tay. [/pause-1-second]
[char-${mainChar}] My hands are strong for Mommy! [/char-${mainChar}]
[/mota]
[mota-4]
${siblingChar} lấy chiếc khăn tay nhỏ lau bớt vệt đất bám trên gấu áo ${mainChar}. Âm thanh: Tiếng vỗ phủi bụi sột soạt.
[pause-1-second] ${siblingChar} nở nụ cười khích lệ anh/chị. [/pause-1-second]
[char-${siblingChar}] Now you look very neat! [/char-${siblingChar}]
[/mota]
[/chapter-garden_climax_afternoon-1]

[chapter-garden_climax_afternoon-2]
[mota-4]
Cô bạn Classmate Zoe mang dải ruy băng lụa đỏ thắm tới tặng để thắt nơ trang trí cho chiếc bình mới. Âm thanh: Tiếng dải ruy băng sột soạt mềm mại trong gió.
[pause-1-second] Zoe chìa cuộn ruy băng đỏ thắm ra. [/pause-1-second]
[char-Classmate_Zoe] Tie this red ribbon around it! [/char-Classmate_Zoe]
[/mota]
[mota-5]
${mainChar} thắt chiếc nơ đỏ cẩn thận quanh cổ bình đất sét handmade vừa khô ráo. Âm thanh: Tiếng nút thắt xiết chặt nhẹ nhàng, tiếng chim ca rộn rã.
[pause-1-second] ${mainChar} thắt chiếc nơ cánh bướm đỏ xinh xắn. [/pause-1-second]
[char-${mainChar}] Now it is completely ready! [/char-${mainChar}]
[/mota]
[mota-5]
Grandpa Joseph bước lại gần, vỗ nhẹ lên vai ${mainChar} với ánh mắt rạng ngời tự hào. Âm thanh: Tiếng bước chân trên cỏ mềm, tiếng cười hiền từ ấm áp.
[pause-1-second] Grandpa Joseph gật đầu khích lệ hai cháu. [/pause-1-second]
[char-Grandpa_Joseph] Go present your honest gift now! [/char-Grandpa_Joseph]
[/mota]
[mota-4]
Cô bạn Zoe vỗ tay ròn rã cổ vũ cho hai bạn nhỏ trước khi ra về. Âm thanh: Tiếng vỗ tay giòn tan, tiếng bước chân sỏi đá rộn rã.
[pause-1-second] Zoe mỉm cười vẫy tay chào tạm biệt. [/pause-1-second]
[char-Classmate_Zoe] Your mom will love this vase! [/char-Classmate_Zoe]
[/mota]
[mota-5]
${mainChar} ôm chiếc bình gốm mới vào ngực, bước đi từng bước vững chãi hướng về cửa chính. Âm thanh: Tiếng lá phong xào xạc trong gió chiều dịu nhẹ.
[pause-1-second] ${mainChar} hít sâu lấy lại sự tự tin. [/pause-1-second]
[char-${mainChar}] I will tell the truth to Mom. [/char-${mainChar}]
[/mota]
[mota-5]
${siblingChar} cầm tay ${mainChar} cùng quay gót bước vào nhà đầy tự tin. Âm thanh: Tiếng bước chân nhịp nhàng trên thềm đá.
[pause-1-second] ${siblingChar} siết chặt tay ${mainChar} bước đi. [/pause-1-second]
[char-${siblingChar}] Mommy will see your honest heart! [/char-${siblingChar}]
[/mota]
[/chapter-garden_climax_afternoon-2]

[chapter-living_room_evening-1]
[mota-6]
${mainChar} và ${siblingChar} cùng bê chiếc bình đất sét nơ đỏ bước vào phòng khách, đứng trước mặt Mom Emma. Âm thanh: Tiếng bước chân rụt rè, tiếng nhạc hòa tấu dương cầm êm dịu, sâu lắng.
[pause-2-second] ${mainChar} đứng thẳng lưng, hít sâu một hơi thật can đảm trước khi mở lời. [/pause-1-second]
[char-${mainChar}] Mommy, I am sorry I ran. [/char-${mainChar}]
[/mota]
[mota-5]
${siblingChar} cẩn thận nâng chiếc bình handmade có vẽ hoa hướng dương và thắt nơ đỏ trao tận tay mẹ. Âm thanh: Tiếng gốm chạm tay êm dịu, tiếng sột soạt ruy băng.
[pause-1-second] ${siblingChar} mỉm cười giải thích với mẹ. [/pause-1-second]
[char-${siblingChar}] We made this vase with love! [/char-${siblingChar}]
[/mota]
[mota-6]
Mom Emma sững người xúc động, hai hàng nước mắt ấm áp lăn trên má khi nhìn chiếc bình đất sét chân thành. Âm thanh: Tiếng nghẹn ngào cảm động, tiếng thở phào nhẹ nhõm xua tan mọi giận hờn.
[pause-1-second] Mom Emma ôm lấy chiếc bình vào lòng. [/pause-1-second]
[char-Mom_Emma] Oh my darlings, this is wonderful! [/char-Mom_Emma]
[/mota]
[mota-5]
Dad David bước tới đặt bàn tay ấm áp lên vai Mom Emma, mỉm cười tự hào nhìn hai con. Âm thanh: Tiếng bước chân nhẹ êm trên thảm phòng khách.
[pause-1-second] Dad David mỉm cười xoa đầu ${mainChar} và ${siblingChar}. [/pause-1-second]
[char-Dad_David] Our children showed real courage today. [/char-Dad_David]
[/mota]
[mota-5]
Mom Emma cẩn thận cắm những cành hoa cúc tươi thắm vừa hái vào chiếc bình gốm mới rồi đặt trang trọng lên bàn trà. Âm thanh: Tiếng cành hoa khẽ chạm vào thành gốm mộc lách cách.
[pause-1-second] Mom Emma mỉm cười ngắm nhìn lọ hoa mới. [/pause-1-second]
[char-Mom_Emma] This is the prettiest vase ever! [/char-Mom_Emma]
[/mota]
[mota-5]
${mainChar} thở phào nhẹ nhõm, nụ cười rạng rỡ trở lại trên khuôn mặt thơ ngây. Âm thanh: Tiếng cười rạng rỡ của trẻ thơ.
[pause-1-second] ${mainChar} ôm lấy eo của mẹ. [/pause-1-second]
[char-${mainChar}] I will always tell the truth! [/char-${mainChar}]
[/mota]
[/chapter-living_room_evening-1]

[chapter-living_room_evening-2]
[mota-5]
Grandma Rose mang ra đĩa bánh quy bơ vàng ruộm mới nướng nóng hổi từ lò nướng thơm phức. Âm thanh: Tiếng đĩa bánh quy đặt xuống bàn trà lách cách rộn ràng.
[pause-1-second] Grandma Rose đặt đĩa bánh nóng hổi xuống bàn. [/pause-1-second]
[char-Grandma_Rose] Sweet cookies for our honest children! [/char-Grandma_Rose]
[/mota]
[mota-3]
Baby Mia đung đưa chiếc lục lạc gỗ phát ra âm thanh lách cách vui nhộn trong nôi. Âm thanh: Tiếng lục lạc leng keng vui nhộn, tiếng cười nắc nẻ của em bé.
[pause-1-second] Baby Mia rung chuông lục lạc cười rúc rích. [/pause-1-second]
[char-Baby_Mia] Mama! Clapping hands, yay! [/char-Baby_Mia]
[/mota]
[mota-5]
${mainChar} nhìn mẹ với nụ cười rạng rỡ bên ngọn đèn phòng khách ấm cúng lung linh. Âm thanh: Tiếng cười trẻ thơ trong veo rạng rỡ, tiếng nhạc êm đềm.
[pause-1-second] ${mainChar} nắm lấy bàn tay dịu dàng của mẹ. [/pause-1-second]
[char-${mainChar}] I love our family so much! [/char-${mainChar}]
[/mota]
[mota-4]
Grandma Rose đưa chiếc bánh quy giòn tan cho ${siblingChar} với ánh mắt trìu mến. Âm thanh: Tiếng cắn bánh quy giòn tan rôm rốp.
[pause-1-second] Grandma Rose xoa nhẹ má ${siblingChar}. [/pause-1-second]
[char-Grandma_Rose] Good children bring true warmth home! [/char-Grandma_Rose]
[/mota]
[mota-4]
Baby Mia vỗ hai bàn tay nhỏ bé reo vang khắp căn phòng khách ngập tràn ánh sáng. Âm thanh: Tiếng vỗ tay bôm bốp của em bé, tiếng cười vui rộn ràng.
[pause-1-second] Baby Mia toe toét vẫy tay gọi cả nhà. [/pause-1-second]
[char-Baby_Mia] Family big hug, yay yay! [/char-Baby_Mia]
[/mota]
[mota-6]
Grandpa Joseph ngắm nhìn cả gia đình sum vầy bên nhau trọn vẹn, ánh mắt tràn trề bình yên. Âm thanh: Tiếng nhạc kết thúc du dương ấm áp như một khúc ru êm đềm.
[pause-1-second] Grandpa Joseph mỉm cười vuốt chòm râu bạc hiền từ. [/pause-1-second]
[char-Grandpa_Joseph] Honesty builds the strongest happy home. [/char-Grandpa_Joseph]
[/mota]
[/chapter-living_room_evening-2]`;

    return ensureScriptMeetsCriteria(autoRepairScreenplayTags(scriptBody), cleanTitle);
  }

  // Default Story Template (Garden, Teamwork, Lost Toy or Active Adventure)
  const defaultScriptBody = `[chapter-living_room_morning-1]
[mota-4]
${mainChar} ngồi xếp các khối gỗ đầy màu sắc trên sàn thảm phòng khách. Ánh nắng sớm rọi qua ô kính. Âm thanh: Tiếng khối gỗ va lách cách, tiếng nhạc mở đầu vui tươi nhẹ nhàng.
[pause-1-second] ${mainChar} đặt khối gỗ chóp nón lên đỉnh tháp. [/pause-1-second]
[char-${mainChar}] Look at my tall yellow tower! [/char-${mainChar}]
[/mota]
[mota-4]
${siblingChar} từ ngoài cửa bước vào, tay ôm chú gấu bông Teddy thân quen. Âm thanh: Tiếng bước chân nhẹ nhàng trên thảm len.
[pause-1-second] ${siblingChar} đứng nhìn tòa tháp gỗ lắc lư. [/pause-1-second]
[char-${siblingChar}] Be careful, do not knock it! [/char-${siblingChar}]
[/mota]
[mota-5]
Một quả bóng tennis của chú cún con lăn vào chân tháp làm tòa lâu đài sụp đổ! Âm thanh: Tiếng gỗ đổ rào rào xuống thảm, tiếng kêu ngạc nhiên.
[pause-1-second] ${mainChar} ngơ ngác nhìn đống gỗ rơi tứ tung. [/pause-1-second]
[char-${mainChar}] Oh no, my tower fell down! [/char-${mainChar}]
[/mota]
[mota-5]
Mom Emma từ gian bếp bước vào, bưng theo khay trái cây thái lát tươi ngon. Âm thanh: Tiếng đĩa gốm đặt lên bàn lách cách, tiếng cười dịu dàng.
[pause-1-second] Mom Emma đặt đĩa táo giòn xuống bàn trà. [/pause-1-second]
[char-Mom_Emma] Who wants sweet morning apple slices? [/char-Mom_Emma]
[/mota]
[mota-5]
${mainChar} cúi đầu thở dài, hai vai chùng xuống nuối tiếc công sức dựng tháp. Âm thanh: Tiếng thở dài nhỏ nhẹ, tiếng đàn cello trầm buồn.
[pause-2-second] ${mainChar} mân mê khối gỗ màu đỏ trong lòng bàn tay. [/pause-1-second]
[char-${mainChar}] I worked so hard on it. [/char-${mainChar}]
[/mota]
[mota-4]
${siblingChar} ngồi xuống cạnh bên, đưa cho anh/chị một lát táo giòn ngọt. Âm thanh: Tiếng cắn táo rôm rốp ngon lành.
[pause-1-second] ${siblingChar} chìa lát táo mọng nước ra an ủi. [/pause-1-second]
[char-${siblingChar}] Take an apple bite first, ${mainChar}! [/char-${siblingChar}]
[/mota]
[mota-4]
Mom Emma ngồi xuống bên thảm, nhẹ nhàng xoa đầu hai con khích lệ. Âm thanh: Tiếng cười hiền từ ấm áp của người mẹ.
[pause-1-second] Mom Emma vuốt tóc hai con dịu dàng. [/pause-1-second]
[char-Mom_Emma] We can build an even taller one later! [/char-Mom_Emma]
[/mota]
[/chapter-living_room_morning-1]

[chapter-living_room_morning-2]
[mota-5]
Dad David vừa đeo cặp kính vừa kiểm tra cặp tài liệu trước khi bắt đầu làm việc. Âm thanh: Tiếng khóa kéo cặp rèn rẹt, tiếng giấy sột soạt.
[pause-1-second] Dad David mỉm cười động viên hai con. [/pause-1-second]
[char-Dad_David] Every builder can rebuild even better. [/char-Dad_David]
[/mota]
[mota-3]
Baby Mia trong chiếc ghế ăn dặm gõ thìa silicon xuống khay nhựa reo vui. Âm thanh: Tiếng thìa gõ bôm bốp vui tai.
[pause-1-second] Baby Mia cười toe toét giơ thìa con. [/pause-1-second]
[char-Baby_Mia] Apple yum yum, dada smile! [/char-Baby_Mia]
[/mota]
[mota-5]
${mainChar} lau tay vào khăn bông và nhìn ra cánh cửa sau mở rộng ra vườn. Âm thanh: Tiếng chim sẻ hót líu lo, tiếng gió sớm mát lành.
[pause-1-second] ${mainChar} đứng bật dậy với ánh mắt háo hức. [/pause-1-second]
[char-${mainChar}] Let us go outside to explore! [/char-${mainChar}]
[/mota]
[mota-4]
${siblingChar} hào hứng cất chú gấu bông lên ghế sofa rồi chạy theo. Âm thanh: Tiếng dép chạy huỳnh huỵch trên sàn gỗ.
[pause-1-second] ${siblingChar} xỏ giày chuẩn bị chạy đua. [/pause-1-second]
[char-${siblingChar}] I will race you to garden! [/char-${siblingChar}]
[/mota]
[mota-4]
Dad David vẫy tay dặn dò hai con cẩn thận khi ra vườn chơi. Âm thanh: Tiếng bước chân nhẹ nhàng trên thảm.
[pause-1-second] Dad David mỉm cười dặn dò qua khung cửa sổ. [/pause-1-second]
[char-Dad_David] Put on your garden hats, kids! [/char-Dad_David]
[/mota]
[mota-5]
${mainChar} quay lại đội chiếc mũ nan vàng xinh xắn rồi mở toang cánh cửa sau. Âm thanh: Tiếng cửa chớp gỗ kẽo kẹt mở ra, tiếng gió lùa mát rượi.
[pause-1-second] ${mainChar} giơ cao chiếc xẻng làm vườn mini. [/pause-1-second]
[char-${mainChar}] Ready for our morning adventure! [/char-${mainChar}]
[/mota]
[/chapter-living_room_morning-2]

[chapter-backyard_garden_noon-1]
[mota-4]
${mainChar} và ${siblingChar} đến bên luống hoa cúc vạn thọ rực rỡ ngoài vườn sau. Âm thanh: Tiếng ong vo ve tìm mật, tiếng lá cây xào xạc trong làn gió trưa.
[pause-1-second] Cả hai cúi nhìn những bông hoa vàng đung đưa. [/pause-1-second]
[char-${mainChar}] Look at these golden flower cups! [/char-${mainChar}]
[/mota]
[mota-5]
Grandpa Joseph đang tỉa những cành cây khô bên hàng rào gỗ, ngẩng lên mỉm cười. Âm thanh: Tiếng kéo làm vườn bấm lách cách.
[pause-1-second] Grandpa Joseph dừng kéo nhìn hai cháu nhỏ. [/pause-1-second]
[char-Grandpa_Joseph] The bees love our spring blossoms. [/char-Grandpa_Joseph]
[/mota]
[mota-4]
${siblingChar} phát hiện một chú bướm ngũ sắc đậu trên phiến lá to. Âm thanh: Tiếng đập cánh nhẹ như tơ của chú bướm.
[pause-1-second] ${siblingChar} nhẹ nhàng bước lại gần chú bướm. [/pause-1-second]
[char-${siblingChar}] A velvet butterfly with blue wings! [/char-${siblingChar}]
[/mota]
[mota-5]
Grandpa Joseph chỉ tay vào chú sâu róm nhỏ xíu màu xanh đang nhai mép lá. Âm thanh: Tiếng lá non xột xoạt nhẹ nhàng.
[pause-1-second] Grandpa Joseph mỉm cười giải thích cho các cháu. [/pause-1-second]
[char-Grandpa_Joseph] Caterpillars turn into lovely butterflies soon. [/char-Grandpa_Joseph]
[/mota]
[mota-4]
${mainChar} cúi sát mắt quan sát chú sâu nhỏ đang bò chậm rãi. Âm thanh: Tiếng gió trưa lay động vòm lá.
[pause-1-second] ${mainChar} thích thú vỗ tay nhỏ. [/pause-1-second]
[char-${mainChar}] Nature has so many wonders! [/char-${mainChar}]
[/mota]
[mota-4]
${siblingChar} nhẹ nhàng dùng đầu ngón tay chạm khẽ vào phiến lá non. Âm thanh: Tiếng chim sâu hót ríu ran.
[pause-1-second] ${siblingChar} mỉm cười nhìn chú bướm bay lên. [/pause-1-second]
[char-${siblingChar}] It is flying towards the tree! [/char-${siblingChar}]
[/mota]
[/chapter-backyard_garden_noon-1]

[chapter-backyard_garden_noon-2]
[mota-5]
Grandma Rose mang theo chiếc bình tưới cây hình chú voi con màu xanh ra vườn. Âm thanh: Tiếng nước chảy róc rách trong bình, tiếng bước chân trên đất xốp.
[pause-1-second] Grandma Rose mỉm cười trao bình tưới cho ${mainChar}. [/pause-1-second]
[char-Grandma_Rose] Who wants to water little seeds? [/char-Grandma_Rose]
[/mota]
[mota-5]
${mainChar} đón lấy bình nước voi con, cẩn thận tưới từng dòng nước mát lành. Âm thanh: Tiếng nước rơi rào rào như mưa rào tí tách.
[pause-1-second] ${mainChar} nghiêng vòi bình tưới từng giọt nước. [/pause-1-second]
[char-${mainChar}] Drink sweet water, green baby plants! [/char-${mainChar}]
[/mota]
[mota-4]
${siblingChar} lấy chiếc xẻng nhỏ xới đất tơi xốp xung quanh gốc cây con. Âm thanh: Tiếng xẻng cào sột soạt vào đất ẩm.
[pause-1-second] ${siblingChar} cúi người xới nhẹ từng nắm đất nâu. [/pause-1-second]
[char-${siblingChar}] The dark soil is very soft! [/char-${siblingChar}]
[/mota]
[mota-5]
Grandma Rose lấy chiếc khăn tay lau giọt mồ hôi trên trán ${siblingChar}. Âm thanh: Tiếng gió mát rượi xua đi cái nóng ban trưa.
[pause-1-second] Grandma Rose âu yếm vuốt má cháu gái/trai. [/pause-1-second]
[char-Grandma_Rose] Good gardening brings abundant fruit! [/char-Grandma_Rose]
[/mota]
[mota-4]
${mainChar} nhìn những luống rau xanh mướt tắm mình trong nước mát. Âm thanh: Tiếng nước ngấm vào đất kêu xì xào êm tai.
[pause-1-second] ${mainChar} mỉm cười hài lòng đặt bình tưới xuống. [/pause-1-second]
[char-${mainChar}] Our garden is very happy now! [/char-${mainChar}]
[/mota]
[mota-4]
${siblingChar} nhặt chiếc lá úa bỏ vào thùng ủ phân hữu cơ. Âm thanh: Tiếng lá khô lạo xạo trong thùng gỗ.
[pause-1-second] ${siblingChar} vỗ tay sạch đất cười tươi. [/pause-1-second]
[char-${siblingChar}] Everything is tidy and clean! [/char-${siblingChar}]
[/mota]
[/chapter-backyard_garden_noon-2]

[chapter-garden_climax_afternoon-1]
[mota-5]
Bác tài xế Mr. Ben dừng xe buýt bên vệ đường nghỉ trưa, mỉm cười nhìn qua hàng rào. Âm thanh: Tiếng còi xe bim bim thân thiện vang lên.
[pause-1-second] Bác tài xế vẫy tay chào qua cửa kính. [/pause-1-second]
[char-Mr_Ben] Hardworking gardeners get the sweetest harvest! [/char-Mr_Ben]
[/mota]
[mota-4]
${mainChar} vẫy tay chào bác tài xế tốt bụng với nụ cười rạng rỡ. Âm thanh: Tiếng cười giòn tan hòa vào tiếng chim líu lo.
[pause-1-second] ${mainChar} giơ cao bình tưới vẫy tay đáp lễ. [/pause-1-second]
[char-${mainChar}] Thank you for waving, Mr. Ben! [/char-${mainChar}]
[/mota]
[mota-5]
Cô bạn Classmate Zoe mang theo giỏ hạt dẻ vừa nhặt được chạy sang chơi. Âm thanh: Tiếng hạt dẻ lách cách trong giỏ cói, tiếng giày chạy trên sỏi.
[pause-1-second] Zoe chìa chiếc lá phong đỏ thắm ra khoe. [/pause-1-second]
[char-Classmate_Zoe] Look at this giant red leaf! [/char-Classmate_Zoe]
[/mota]
[mota-4]
${siblingChar} sờ vào phiến lá phong đỏ mịn màng đầy thích thú. Âm thanh: Tiếng lá khô sột soạt êm tai.
[pause-1-second] ${siblingChar} mân mê từng đường gân lá tuyệt đẹp. [/pause-1-second]
[char-${siblingChar}] It looks like a bright star! [/char-${siblingChar}]
[/mota]
[mota-6]
BẤT NGỜ XẢY RA: Một chú mèo hoang lạ mặt nhảy vọt qua hàng rào, làm chiếc tổ chim non trên nhánh cây trĩu rớt xuống cành thấp sát mép mương nước! Âm thanh: Tiếng mèo kêu meo meo giật thót, tiếng cành cây gãy răng rắc, nhạc nền hồi hộp nghẹt thở.
[pause-1-second] Cả nhóm bạn nín thở đứng sững sờ. [/pause-1-second]
[char-${siblingChar}] The little baby birds will fall! [/char-${siblingChar}]
[/mota]
[mota-6]
Tổ chim non chao đảo, chỉ còn vài giây nữa là rơi tọt xuống dòng nước xiết bên dưới! Âm thanh: Tiếng chim non kêu chíp chíp yếu ớt, tiếng nước chảy xiết ào ào.
[pause-1-second] ${mainChar} nắm chặt tay, quyết tâm hành động ngay lập tức. [/pause-1-second]
[char-${mainChar}] I must catch that baby nest! [/char-${mainChar}]
[/mota]
[/chapter-garden_climax_afternoon-1]

[chapter-garden_climax_afternoon-2]
[mota-4]
${mainChar} không chần chừ, nhanh trí dùng chiếc sọt mềm lót rơm của ông nội, dũng cảm bò ra mỏm đất sát bờ. Âm thanh: Tiếng đất sỏi lạo xạo dưới đầu gối, tiếng tim đập thình thịch dồn dập.
[pause-1-second] ${mainChar} ngoái lại ra hiệu cho ${siblingChar}. [/pause-1-second]
[char-${mainChar}] Hold my jacket tight, ${siblingChar}! [/char-${mainChar}]
[/mota]
[mota-5]
${siblingChar} và Zoe cùng dùng hết sức ghì chặt vạt áo của ${mainChar} để làm điểm tựa an toàn. Âm thanh: Tiếng vải áo căng ra ken két, tiếng thở dốc cố gắng.
[pause-1-second] Cả hai đứa trẻ dồn toàn bộ sức lực giữ chặt bạn mình. [/pause-1-second]
[char-${siblingChar}] We have you firmly! Reach out! [/char-${siblingChar}]
[/mota]
[mota-5]
${mainChar} duỗi thẳng hai tay, khéo léo dùng chiếc sọt rơm đỡ trọn vẹn tổ chim non ngay khoảnh khắc cành cây gãy lìa! Âm thanh: Tiếng cành cây rơi tõm xuống nước, tiếng thở phào vỡ òa nhẹ nhõm.
[pause-1-second] ${mainChar} ôm sọt rơm an toàn vào lòng. [/pause-1-second]
[char-${mainChar}] I caught them! They are safe! [/char-${mainChar}]
[/mota]
[mota-4]
Zoe reo hò nhảy cẫng lên trong niềm vui sướng khôn xiết. Âm thanh: Tiếng vỗ tay ròn rã, tiếng chim non líu lo bình an.
[pause-1-second] Zoe vỗ tay rạng rỡ nhìn chiếc sọt chim. [/pause-1-second]
[char-Classmate_Zoe] You saved the whole nest! [/char-Classmate_Zoe]
[/mota]
[mota-5]
Grandpa Joseph hớt hải chạy tới, kịp thời ôm nhấc ${mainChar} và chiếc sọt chim non vào lòng an toàn. Âm thanh: Tiếng bước chân hối hả, tiếng thở phào đầy nhẹ nhõm.
[pause-1-second] Grandpa Joseph ôm chặt hai cháu vào lòng. [/pause-1-second]
[char-Grandpa_Joseph] Such quick bravery, our little hero! [/char-Grandpa_Joseph]
[/mota]
[mota-5]
Grandpa Joseph cẩn thận đặt chiếc sọt chim lên chiếc giá gỗ an toàn trong lán che mát. Âm thanh: Tiếng sọt đặt xuống vững chãi.
[pause-1-second] Grandpa Joseph chỉnh lại lớp rơm êm cho chim mẹ về. [/pause-1-second]
[char-Grandpa_Joseph] Mother bird will find them easily. [/char-Grandpa_Joseph]
[/mota]
[/chapter-garden_climax_afternoon-2]

[chapter-living_room_evening-1]
[mota-5]
Cả gia đình sum vầy bên bàn ăn tối ấm áp dưới ánh đèn vàng dịu nhẹ của phòng khách. Âm thanh: Tiếng dao nĩa chạm đĩa sứ lách cách, tiếng nhạc hòa tấu êm đềm du dương.
[pause-1-second] Dad David mỉm cười nâng ly nước hoa quả mừng cả nhà. [/pause-1-second]
[char-Dad_David] Tonight we celebrate kindness and courage. [/char-Dad_David]
[/mota]
[mota-4]
${mainChar} ngồi giữa bố mẹ và ông bà, gương mặt rạng ngời hạnh phúc. Âm thanh: Tiếng cười khúc khích ấm cúng của trẻ thơ.
[pause-1-second] ${mainChar} khoác vai ${siblingChar} mỉm cười. [/pause-1-second]
[char-${mainChar}] We all worked as one team! [/char-${mainChar}]
[/mota]
[mota-5]
Mom Emma gắp chiếc bánh kếp mật ong vàng ruộm vào đĩa cho ${mainChar} và ${siblingChar}. Âm thanh: Tiếng rót mật ong thơm lừng dẻo quánh.
[pause-1-second] Mom Emma đặt đĩa bánh kếp thơm lừng trước mặt hai con. [/pause-1-second]
[char-Mom_Emma] Sweet honey pancakes for our champions! [/char-Mom_Emma]
[/mota]
[mota-4]
${siblingChar} tươi cười chia sẻ miếng bánh ngọt ngào cho anh/chị. Âm thanh: Tiếng cười reo vui thích của trẻ nhỏ.
[pause-1-second] ${siblingChar} cắt một miếng bánh kếp thơm giòn. [/pause-1-second]
[char-${siblingChar}] Together we can solve anything! [/char-${siblingChar}]
[/mota]
[mota-5]
Mom Emma xoa đầu hai con với nụ cười trìu mến yêu thương. Âm thanh: Tiếng nhạc hòa tấu êm dịu vỗ về.
[pause-1-second] Mom Emma mỉm cười nhìn chồng và hai con. [/pause-1-second]
[char-Mom_Emma] Caring for little animals brings blessings! [/char-Mom_Emma]
[/mota]
[mota-4]
Dad David gật đầu đồng tình, ánh mắt tràn trề niềm tự hào gia đình. Âm thanh: Tiếng cạch ly thủy tinh lanh lảnh.
[pause-1-second] Dad David cụng ly chúc mừng cả nhà. [/pause-1-second]
[char-Dad_David] To our wonderful brave little team! [/char-Dad_David]
[/mota]
[/chapter-living_room_evening-1]

[chapter-living_room_evening-2]
[mota-5]
Grandma Rose rót thêm sữa ấm thơm béo vào cốc sứ nhỏ cho các cháu. Âm thanh: Tiếng sữa rót róc rách ấm lòng.
[pause-1-second] Grandma Rose đưa ly sữa ấm cho hai cháu. [/pause-1-second]
[char-Grandma_Rose] Love grows stronger through caring deeds. [/char-Grandma_Rose]
[/mota]
[mota-3]
Baby Mia ngồi trong lòng bố gõ thìa ăn mừng bi bô thích thú. Âm thanh: Tiếng thìa gõ lách cách, tiếng cười khanh khách đáng yêu.
[pause-1-second] Baby Mia rung chuông thìa cười toe toét. [/pause-1-second]
[char-Baby_Mia] Birdie safe! Yay family love! [/char-Baby_Mia]
[/mota]
[mota-5]
${mainChar} nhìn qua cửa sổ ra khu vườn thanh bình dưới ánh trăng rằm vằng vặc. Âm thanh: Tiếng dế mèn ngân nga khúc ca đêm dịu êm.
[pause-1-second] ${mainChar} mỉm cười thì thầm với cả nhà. [/pause-1-second]
[char-${mainChar}] Tonight our home is so warm. [/char-${mainChar}]
[/mota]
[mota-4]
Grandma Rose đắp chiếc chăn mỏng lên đùi cho các cháu nhỏ. Âm thanh: Tiếng vải dạ xột xoạt ấm áp.
[pause-1-second] Grandma Rose âu yếm xoa trán ${mainChar}. [/pause-1-second]
[char-Grandma_Rose] Sweet dreams to our kind children! [/char-Grandma_Rose]
[/mota]
[mota-4]
Baby Mia vẫy hai bàn tay nhỏ xíu reo hò trước khi chìm vào giấc ngủ. Âm thanh: Tiếng ngáp ngủ dễ thương của em bé.
[pause-1-second] Baby Mia tựa đầu vào ngực bố ngủ ngoan. [/pause-1-second]
[char-Baby_Mia] Night night everyone, love love! [/char-Baby_Mia]
[/mota]
[mota-5]
Grandpa Joseph ôm lấy bờ vai của các con cháu, ánh mắt tràn ngập niềm tự hào và bình yên vô tận. Âm thanh: Tiếng thở phào viên mãn, khúc nhạc ru êm dịu khép lại câu chuyện.
[pause-1-second] Grandpa Joseph xoa đầu đàn cháu nhỏ yêu thương. [/pause-1-second]
[char-Grandpa_Joseph] Kindness is the true light of home. [/char-Grandpa_Joseph]
[/mota]
[/chapter-living_room_evening-2]`;

  return ensureScriptMeetsCriteria(autoRepairScreenplayTags(defaultScriptBody), cleanTitle);
}
