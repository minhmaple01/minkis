import React from "react";
import { X, Users, Heart, BookOpen, ShieldCheck, Sparkles } from "lucide-react";
import { FIXED_CHARACTERS } from "../data/characters";

interface CastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CastModal: React.FC<CastModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const familyMembers = Object.values(FIXED_CHARACTERS).filter(
    (c) => c.role !== "Recurring Guest" && c.role !== "School Guest"
  );
  const guestMembers = Object.values(FIXED_CHARACTERS).filter(
    (c) => c.role === "Recurring Guest" || c.role === "School Guest"
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-amber-50/70 dark:bg-neutral-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                Gia Phả Cố Định (StoryForge Kids EN Family Lore)
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                BẮT BUỘC dùng lại cho MỌI câu chuyện — Giữ đúng tên, tuổi, tính cách & quan hệ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Family Members */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-1.5">
              <Heart className="w-4 h-4" /> 7 Thành viên Cốt lõi của Gia đình
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {familyMembers.map((member) => (
                <div
                  key={member.id}
                  className={`p-3.5 rounded-xl border ${member.bubbleBg} ${member.bubbleBorder}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xl">{member.avatarEmoji}</span>
                    <div>
                      <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                        <span>{member.name}</span>
                        <span className="text-xs font-normal text-neutral-500">({member.age})</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${member.badgeBg} ${member.badgeBorder} ${member.badgeText}`}>
                        [{member.tag}]
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2 leading-relaxed">
                    <strong className="text-neutral-800 dark:text-neutral-200">Quan hệ:</strong> {member.relation}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                    <strong className="text-neutral-800 dark:text-neutral-200">Tính cách:</strong> {member.personality}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Guest Members */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Nhân vật Khách thường gặp (Recurring Guests)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guestMembers.map((guest) => (
                <div
                  key={guest.id}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{guest.avatarEmoji}</span>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">{guest.name}</span>
                    <code className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700">
                      [{guest.tag}]
                    </code>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {guest.relation} • {guest.personality}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 4-Act Formula & Strict Audio/Timing Rules Reference */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> Cấu trúc Cảm xúc 4 Màn & Thử Thách Cao Trào
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                <li><strong>Mở đầu:</strong> Giới thiệu nhân vật chính & một vấn đề/cảm xúc gần gũi với trẻ (bị bỏ quên, ghen tị, sợ hãi, vô tình làm hỏng đồ...).</li>
                <li><strong>Diễn biến tăng dần:</strong> Vấn đề tăng cấp, có hiểu lầm hoặc nỗ lực giải quyết ban đầu nhưng gặp khó khăn.</li>
                <li><strong>Cao trào & Thử thách bất ngờ:</strong> Bắt buộc có 1 chi tiết bất ngờ / tình huống khó xử. Nhân vật chính (Henry/Lucy) không chỉ được an ủi thụ động mà <em>phải chủ động hành động tự giải quyết</em> (nhanh trí cứu nguy, dũng cảm nhận lỗi, tự tay khắc phục...) trước khi được gia đình ôm ấp hỗ trợ.</li>
                <li><strong>Kết thúc ấm áp:</strong> Vấn đề được giải quyết trọn vẹn, gia đình đoàn tụ sum vầy, rút ra bài học tích cực qua lời thoại cuối.</li>
              </ol>
            </div>

            <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/60 text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
              <div className="font-bold text-amber-800 dark:text-amber-300">Cấu trúc thẻ lồng nhau & Quy tắc kỹ thuật:</div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li><strong>Cấu trúc thẻ lồng nhau:</strong> Thẻ <code>[Tên_Nhân_Vật][/Tên_Nhân_Vật]</code> (ví dụ: <code>[Mom_Emma]...[/Mom_Emma]</code>, <code>[Henry]...[/Henry]</code>) bắt buộc phải nằm LỒNG BÊN TRONG thẻ <code>[mota-sss][/mota]</code>. Không dùng thẻ [style].</li>
                <li><strong>Thẻ khoảng lặng [1-second]:</strong> Đặt bên trong <code>[mota]</code> để thể hiện biểu cảm, suy nghĩ, hồi hộp trước khi nói. Ở giữa 2 nhân vật nói trong cùng 1 cảnh có thể không cần thẻ pause.</li>
                <li><strong>Quy tắc tính thời lượng:</strong> <code>sss(mota) = sss(pause, nếu có) + thời lượng câu thoại</code>. Tổng thời lượng toàn kịch bản từ 300–460 giây (~5.0–7.5 phút).</li>
                <li><strong>Số lượng câu & từ ngữ:</strong> 60–90 câu thoại; câu cực ngắn 2–5 từ (tối đa 8 từ/câu) để nói ít trên mỗi cảnh; tốc độ nói chậm rãi 1.1–1.5 từ/s (≤ 1.7 từ/s).</li>
                <li><strong>Thời lượng cảnh:</strong> Mỗi cảnh <code>[mota]</code> có thời lượng 6s, 8s hoặc 10s, kết thúc bằng 1 thẻ <code>[1-second]</code> đệm.</li>
                <li><strong>Âm thanh bắt buộc:</strong> 100% thẻ <code>[mota]</code> phải có phần mô tả âm thanh cụ thể (tiếng động môi trường, nhạc nền, SFX).</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold text-xs transition"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
