from __future__ import annotations

import json
import re
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[1]
DOCX = Path(r"D:\桌面\念经\金刚经讲解文.docx")
OUT_FILE = ROOT / "app/data/diamond.ts"

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
BLUE_COLORS = {"0070C0", "00B0F0"}

# Public-domain Kumarajiva text, chaptered to match the app's "第一章 ..." UI.
STANDARD_CHAPTERS: list[tuple[str, list[str]]] = [
    (
        "第一章 法会因由分",
        [
            "如是我闻。一时，佛在舍卫国祇树给孤独园，与大比丘众千二百五十人俱。尔时，世尊食时，著衣持钵，入舍卫大城乞食。于其城中，次第乞已，还至本处。饭食讫，收衣钵，洗足已，敷座而坐。",
        ],
    ),
    (
        "第二章 善现启请分",
        [
            "时，长老须菩提，在大众中，即从座起，偏袒右肩，右膝著地，合掌恭敬。而白佛言：“希有世尊！如来善护念诸菩萨，善付嘱诸菩萨。世尊！善男子、善女人，发阿耨多罗三藐三菩提心，应云何住？云何降伏其心？”",
            "佛言：“善哉，善哉。须菩提！如汝所说：如来善护念诸菩萨，善付嘱诸菩萨。汝今谛听，当为汝说：善男子、善女人，发阿耨多罗三藐三菩提心，应如是住，如是降伏其心。”",
            "“唯然，世尊！愿乐欲闻。”",
        ],
    ),
    (
        "第三章 大乘正宗分",
        [
            "佛告须菩提：“诸菩萨摩诃萨，应如是降伏其心：所有一切众生之类，若卵生、若胎生、若湿生、若化生；若有色、若无色；若有想、若无想、若非有想非无想，我皆令入无余涅槃而灭度之。如是灭度无量无数无边众生，实无众生得灭度者。何以故？须菩提！若菩萨有我相、人相、众生相、寿者相，即非菩萨。”",
        ],
    ),
    (
        "第四章 妙行无住分",
        [
            "“复次，须菩提！菩萨于法，应无所住，行于布施。所谓不住色布施，不住声、香、味、触、法布施。须菩提！菩萨应如是布施，不住于相。何以故？若菩萨不住相布施。其福德不可思量。”",
            "“须菩提！于意云何？东方虚空，可思量不？”",
            "“不也，世尊！”",
            "“须菩提！南、西、北方，四维上下虚空，可思量不？”",
            "“不也，世尊！”",
            "“须菩提！菩萨无住相布施，福德亦复如是不可思量。须菩提！菩萨但应如所教住。”",
        ],
    ),
    (
        "第五章 如理实见分",
        [
            "“须菩提。于意云何？可以身相见如来不？”",
            "“不也，世尊，不可以身相得见如来。何以故？如来所说身相，即非身相。”",
            "佛告须菩提：“凡所有相，皆是虚妄。若见诸相非相，即见如来。”",
        ],
    ),
    (
        "第六章 正信希有分",
        [
            "须菩提白佛言：“世尊！颇有众生，得闻如是言说章句，生实信不？”",
            "佛告须菩提：“莫作是说。如来灭后，后五百岁，有持戒修福者，于此章句能生信心，以此为实，当知是人不于一佛、二佛、三四五佛而种善根，已于无量千万佛所种诸善根，闻是章句，乃至一念生净信者，须菩提！如来悉知悉见，是诸众生得如是无量福德。何以故？是诸众生无复我相、人相、众生相、寿者相。”",
            "“无法相，亦无非法相。何以故？是诸众生若心取相，则为著我、人、众生、寿者。”",
            "“若取法相，即著我、人、众生、寿者。何以故？若取非法相，即著我、人、众生、寿者。是故不应取法，不应取非法。以是义故，如来常说：汝等比丘，知我说法，如筏喻者，法尚应舍，何况非法。”",
        ],
    ),
    (
        "第七章 无得无说分",
        [
            "“须菩提！于意云何？如来得阿耨多罗三藐三菩提耶？如来有所说法耶？”",
            "须菩提言：“如我解佛所说义，无有定法，名阿耨多罗三藐三菩提，亦无有定法，如来可说。何以故？如来所说法，皆不可取、不可说；非法，非非法。所以者何？一切贤圣，皆以无为法而有差别。”",
        ],
    ),
    (
        "第八章 依法出生分",
        [
            "“须菩提！于意云何？若人满三千大千世界七宝以用布施，是人所得福德，宁为多不？”",
            "须菩提言：“甚多，世尊！何以故？是福德即非福德性，是故如来说福德多。”",
            "“若复有人，于此经中受持，乃至四句偈等，为他人说，其福胜彼。何以故？须菩提！一切诸佛，及诸佛阿耨多罗三藐三菩提法，皆从此经出。须菩提！所谓佛法者，即非佛法，是名佛法。”",
        ],
    ),
    (
        "第九章 一相无相分",
        [
            "“须菩提！于意云何？须陀洹能作是念：‘我得须陀洹果’不？”",
            "须菩提言：“不也，世尊！何以故？须陀洹名为入流，而无所入；不入色、声、香、味、触、法，是名须陀洹。”",
            "“须菩提！于意云何？斯陀含能作是念：‘我得斯陀含果’不？”",
            "须菩提言：“不也，世尊！何以故？斯陀含名一往来，而实无往来，是名斯陀含。”",
            "“须菩提！于意云何？阿那含能作是念：‘我得阿那含果’不？”",
            "须菩提言：“不也，世尊！何以故？阿那含名为不来，而实无不来，是故名阿那含。”",
            "“须菩提！于意云何？阿罗汉能作是念：‘我得阿罗汉道’不？”",
            "须菩提言：“不也，世尊！何以故？实无有法名阿罗汉。世尊！若阿罗汉作是念：‘我得阿罗汉道’，即为著我、人、众生、寿者。世尊！佛说我得无诤三昧，人中最为第一，是第一离欲阿罗汉。世尊！我不作是念：‘我是离欲阿罗汉。’世尊！我若作是念：‘我得阿罗汉道。’世尊则不说须菩提是乐阿兰那行者。以须菩提实无所行，而名须菩提，是乐阿兰那行。”",
        ],
    ),
    (
        "第十章 庄严净土分",
        [
            "佛告须菩提：“于意云何？如来昔在燃灯佛所，于法有所得不？”",
            "“不也，世尊！如来在燃灯佛所，于法实无所得。”",
            "“须菩提！于意云何？菩萨庄严佛土不？”",
            "“不也，世尊！何以故？庄严佛土者，即非庄严，是名庄严。”",
            "“是故，须菩提！诸菩萨摩诃萨，应如是生清净心，不应住色生心，不应住声、香、味、触、法生心，应无所住而生其心。”",
            "“须菩提！譬如有人，身如须弥山王，于意云何？是身为大不？”",
            "须菩提言：“甚大，世尊！何以故？佛说非身，是名大身。”",
        ],
    ),
    (
        "第十一章 无为福胜分",
        [
            "“须菩提！如恒河中所有沙数，如是沙等恒河，于意云何？是诸恒河沙，宁为多不？”",
            "须菩提言：“甚多，世尊！但诸恒河，尚多无数，何况其沙。”",
            "“须菩提！我今实言告汝：若有善男子、善女人，以七宝满尔所恒河沙数三千大千世界，以用布施，得福多不？”",
            "须菩提言：“甚多，世尊！”",
            "佛告须菩提：“若善男子、善女人，于此经中，乃至受持四句偈等，为他人说，而此福德，胜前福德。”",
        ],
    ),
    (
        "第十二章 尊重正教分",
        [
            "“复次，须菩提！随说是经，乃至四句偈等，当知此处，一切世间，天、人、阿修罗，皆应供养，如佛塔庙。何况有人，尽能受持读诵。须菩提！当知是人成就最上第一希有之法，若是经典所在之处，即为有佛，若尊重弟子。”",
        ],
    ),
    (
        "第十三章 如法受持分",
        [
            "尔时，须菩提白佛言：“世尊！当何名此经？我等云何奉持？”",
            "佛告须菩提：“是经名为金刚般若波罗蜜，以是名字，汝当奉持。所以者何？须菩提！佛说般若波罗蜜，即非般若波罗蜜。是名般若波罗蜜。须菩提！于意云何？如来有所说法不？”",
            "须菩提白佛言：“世尊！如来无所说。”",
            "“须菩提！于意云何？三千大千世界所有微尘，是为多不？”",
            "须菩提言：“甚多，世尊！”",
            "“须菩提！诸微尘，如来说非微尘，是名微尘。如来说：世界，非世界，是名世界。须菩提！于意云何？可以三十二相见如来不？”",
            "“不也，世尊！不可以三十二相得见如来。何以故？如来说：三十二相，即是非相，是名三十二相。”",
            "“须菩提！若有善男子、善女人，以恒河沙等身命布施；若复有人，于此经中，乃至受持四句偈等，为他人说，其福甚多！”",
        ],
    ),
    (
        "第十四章 离相寂灭分",
        [
            "尔时，须菩提闻说是经，深解义趣，涕泪悲泣，而白佛言：“希有世尊！佛说如是甚深经典，我从昔来所得慧眼，未曾得闻如是之经。世尊！若复有人，得闻是经，信心清净，则生实相，当知是人，成就第一希有功德。世尊！是实相者，则是非相，是故如来说名实相。世尊！我今得闻如是经典，信解受持，不足为难；若当来世，后五百岁，其有众生，得闻是经，信解受持，是人则为第一希有。何以故？此人无我相、无人相、无众生相、无寿者相。所以者何？我相，即是非相；人相、众生相、寿者相，即是非相。何以故？离一切诸相，则名诸佛。”",
            "佛告须菩提：“如是，如是！若复有人，得闻是经，不惊、不怖、不畏，当知是人，甚为希有。何以故？须菩提！如来说：第一波罗蜜，即非第一波罗蜜，是名第一波罗蜜。须菩提！忍辱波罗蜜，如来说非忍辱波罗蜜。是名忍辱波罗蜜。何以故？须菩提！如我昔为歌利王割截身体，我于尔时，无我相、无人相、无众生相、无寿者相。何以故？我于往昔，节节支解时，若有我相、人相、众生相、寿者相，应生瞋恨。须菩提！又念过去，于五百世，作忍辱仙人，于尔所世，无我相、无人相、无众生相、无寿者相。是故须菩提！菩萨应离一切相，发阿耨多罗三藐三菩提心。不应住色生心，不应住声、香、味、触、法生心，应生无所住心。若心有住，则为非住。”",
            "“是故佛说：菩萨心不应住色布施。须菩提！菩萨为利益一切众生故，应如是布施。如来说：一切诸相，即是非相。又说：一切众生，即非众生。须菩提！如来是真语者、实语者、如语者、不诳语者、不异语者。”",
            "“须菩提！如来所得法，此法无实无虚。须菩提！若菩萨心住于法而行布施，如人入暗，则无所见；若菩萨心不住法而行布施，如人有目，日光明照，见种种色。”",
            "“须菩提！当来之世，若有善男子、善女人，能于此经，受持读诵，则为如来，以佛智慧，悉知是人，悉见是人，皆得成就无量无边功德。”",
        ],
    ),
    (
        "第十五章 持经功德分",
        [
            "“须菩提！若有善男子、善女人，初日分以恒河沙等身布施，中日分复以恒河沙等身布施，后日分亦以恒河沙等身布施，如是无量百千万亿劫，以身布施；若复有人，闻此经典，信心不逆，其福胜彼，何况书写、受持、读诵、为人解说。”",
            "“须菩提！以要言之，是经有不可思议、不可称量、无边功德。如来为发大乘者说，为发最上乘者说。若有人能受持读诵，广为人说，如来悉知是人，悉见是人，皆得成就不可量、不可称、无有边、不可思议功德。”",
            "“如是人等，则为荷担如来阿耨多罗三藐三菩提。何以故？须菩提！若乐小法者，著我见、人见、众生见、寿者见，则于此经不能听受、读诵，为人解说。”",
            "“须菩提！在在处处，若有此经，一切世间，天、人、阿修罗，所应供养；当知此处，则为是塔，皆应恭敬，作礼围绕，以诸华香而散其处。”",
        ],
    ),
    (
        "第十六章 能净业障分",
        [
            "“复次，须菩提！善男子、善女人，受持读诵此经，若为人轻贱，是人先世罪业，应堕恶道，以今世人轻贱故，先世罪业则为消灭，当得阿耨多罗三藐三菩提。”",
            "“须菩提！我念过去无量阿僧祇劫，于燃灯佛前，得值八百四千万亿那由他诸佛，悉皆供养承事，无空过者；若复有人，于后末世，能受持读诵此经，所得功德，于我所供养诸佛功德，百分不及一，千万亿分、乃至算数譬喻所不能及。”",
            "“须菩提！若善男子，善女人，于后末世，有受持读诵此经，所得功德，我若具说者，或有人闻，心则狂乱，狐疑不信。须菩提！当知是经义不可思议，果报亦不可思议！”",
        ],
    ),
    (
        "第十七章 究竟无我分",
        [
            "尔时，须菩提白佛言：“世尊！善男子、善女人，发阿耨多罗三藐三菩提心，云何应住？云何降伏其心？”",
            "佛告须菩提：“善男子、善女人，发阿耨多罗三藐三菩提心者，当生如是心：我应灭度一切众生。灭度一切众生已，而无有一众生实灭度者。何以故？须菩提！若菩萨有我相、人相、众生相、寿者相，则非菩萨。所以者何？须菩提！实无有法，发阿耨多罗三藐三菩提心者。”",
            "“须菩提！于意云何？如来于燃灯佛所，有法得阿耨多罗三藐三菩提不？”",
            "“不也，世尊！如我解佛所说义，佛于燃灯佛所，无有法得阿耨多罗三藐三菩提。”",
            "佛言：“如是，如是！须菩提！实无有法，如来得阿耨多罗三藐三菩提。须菩提！若有法，如来得阿耨多罗三藐三菩提者，燃灯佛则不与我授记：‘汝于来世，当得作佛，号释迦牟尼。’以实无有法得阿耨多罗三藐三菩提，是故燃灯佛与我授记，作是言：‘汝于来世，当得作佛，号释迦牟尼。’何以故？如来者，即诸法如义。”",
            "“若有人言：如来得阿耨多罗三藐三菩提。须菩提！实无有法，佛得阿耨多罗三藐三菩提。须菩提！如来所得阿耨多罗三藐三菩提，于是中无实无虚。是故如来说：一切法皆是佛法。须菩提！所言一切法者，即非一切法，是故名一切法。”",
            "“须菩提！譬如人身长大。”",
            "须菩提言：“世尊！如来说：人身长大，则为非大身，是名大身。”",
            "“须菩提！菩萨亦如是。若作是言：我当灭度无量众生，则不名菩萨。何以故？须菩提！实无有法名为菩萨。是故佛说一切法，无我、无人、无众生、无寿者。”",
            "“须菩提！若菩萨作是言：‘我当庄严佛土’，是不名菩萨。何以故？如来说：庄严佛土者，即非庄严，是名庄严。”",
            "“须菩提！若菩萨通达无我、法者，如来说名真是菩萨。”",
        ],
    ),
    (
        "第十八章 一体同观分",
        [
            "“须菩提！于意云何？如来有肉眼不？”",
            "“如是，世尊！如来有肉眼。”",
            "“须菩提！于意云何？如来有天眼不？”",
            "“如是，世尊！如来有天眼。”",
            "“须菩提！于意云何？如来有慧眼不？”",
            "“如是，世尊！如来有慧眼。”",
            "“须菩提！于意云何？如来有法眼不？”",
            "“如是，世尊！如来有法眼。”",
            "“须菩提！于意云何？如来有佛眼不？”",
            "“如是，世尊！如来有佛眼。”",
            "“须菩提！于意云何？如恒河中所有沙，佛说是沙不？”",
            "“如是，世尊！如来说是沙。”",
            "“须菩提！于意云何？如一恒河中所有沙，有如是沙等恒河，是诸恒河所有沙数，佛世界如是，宁为多不？”",
            "“甚多，世尊。”",
            "佛告须菩提：“尔所国土中，所有众生，若干种心，如来悉知。何以故？如来说：诸心皆为非心，是名为心。所以者何？须菩提！过去心不可得，现在心不可得，未来心不可得。”",
        ],
    ),
    (
        "第十九章 法界通化分",
        [
            "“须菩提！于意云何？若有人满三千大千世界七宝，以用布施，是人以是因缘，得福多不？”",
            "“如是，世尊！此人以是因缘，得福甚多。”",
            "“须菩提！若福德有实，如来不说得福德多；以福德无故，如来说得福德多。”",
        ],
    ),
    (
        "第二十章 离色离相分",
        [
            "“须菩提！于意云何？佛可以具足色身见不？”",
            "“不也，世尊！如来不应以具足色身见。何以故？如来说：具足色身，即非具足色身，是名具足色身。”",
            "“须菩提！于意云何？如来可以具足诸相见不？”",
            "“不也，世尊！如来不应以具足诸相见。何以故？如来说：诸相具足，即非具足。是名诸相具足。”",
        ],
    ),
    (
        "第二十一章 非说所说分",
        [
            "“须菩提！汝勿谓如来作是念：‘我当有所说法。’莫作是念。何以故？若人言：如来有所说法，即为谤佛，不能解我所说故。须菩提！说法者，无法可说，是名说法。”",
            "尔时，慧命须菩提白佛言：“世尊！颇有众生，于未来世，闻说是法，生信心不？”",
            "佛言：“须菩提！彼非众生，非不众生。何以故？须菩提！众生众生者，如来说非众生，是名众生。”",
        ],
    ),
    (
        "第二十二章 无法可得分",
        [
            "须菩提白佛言：“世尊！佛得阿耨多罗三藐三菩提，为无所得耶？”",
            "佛言：“如是，如是。须菩提！我于阿耨多罗三藐三菩提乃至无有少法可得，是名阿耨多罗三藐三菩提。”",
        ],
    ),
    (
        "第二十三章 净心行善分",
        [
            "“复次，须菩提！是法平等，无有高下，是名阿耨多罗三藐三菩提；以无我、无人、无众生、无寿者，修一切善法，则得阿耨多罗三藐三菩提。须菩提！所言善法者，如来说即非善法，是名善法。”",
        ],
    ),
    (
        "第二十四章 福智无比分",
        [
            "“须菩提！若三千大千世界中，所有诸须弥山王，如是等七宝聚，有人持用布施；若人以此般若波罗蜜经，乃至四句偈等，受持读诵，为他人说，于前福德百分不及一，百千万亿分、乃至算数譬喻所不能及。”",
        ],
    ),
    (
        "第二十五章 化无所化分",
        [
            "“须菩提！于意云何？汝等勿谓如来作是念：‘我当度众生。’须菩提！莫作是念。何以故？实无有众生如来度者。若有众生如来度者，如来则有我、人、众生、寿者。须菩提！如来说：‘有我者，则非有我，而凡夫之人以为有我。’须菩提！凡夫者，如来说则非凡夫，是名凡夫。”",
        ],
    ),
    (
        "第二十六章 法身非相分",
        [
            "“须菩提！于意云何？可以三十二相观如来不？”",
            "须菩提言：“如是！如是！以三十二相观如来。”",
            "佛言：“须菩提！若以三十二相观如来者，转轮圣王则是如来。”",
            "须菩提白佛言：“世尊！如我解佛所说义，不应以三十二相观如来。”",
            "尔时，世尊而说偈言：“若以色见我，以音声求我，是人行邪道，不能见如来。”",
        ],
    ),
    (
        "第二十七章 无断无灭分",
        [
            "“须菩提！汝若作是念：‘如来不以具足相故，得阿耨多罗三藐三菩提。’须菩提！莫作是念：‘如来不以具足相故，得阿耨多罗三藐三菩提。’”",
            "“须菩提！汝若作是念，发阿耨多罗三藐三菩提心者，说诸法断灭。莫作是念！何以故？发阿耨多罗三藐三菩提心者，于法不说断灭相。”",
        ],
    ),
    (
        "第二十八章 不受不贪分",
        [
            "“须菩提！若菩萨以满恒河沙等世界七宝持用布施；若复有人，知一切法无我，得成于忍，此菩萨胜前菩萨所得功德。何以故？须菩提！以诸菩萨不受福德故。”",
            "须菩提白佛言：“世尊！云何菩萨不受福德？”",
            "“须菩提！菩萨所作福德，不应贪著。是故说不受福德。”",
        ],
    ),
    (
        "第二十九章 威仪寂静分",
        [
            "“须菩提！若有人言：如来若来若去，若坐若卧，是人不解我所说义。何以故？如来者，无所从来，亦无所去，故名如来。”",
        ],
    ),
    (
        "第三十章 一合理相分",
        [
            "“须菩提！若善男子、善女人，以三千大千世界碎为微尘，于意云何？是微尘众宁为多不？”",
            "须菩提言：“甚多，世尊！何以故？若是微尘众实有者，佛则不说是微尘众。所以者何？佛说微尘众，则非微尘众，是名微尘众。”",
            "“世尊！如来所说三千大千世界，则非世界，是名世界。何以故？若世界实有者，则是一合相。如来说一合相，则非一合相，是名一合相。”",
            "“须菩提！一合相者，则是不可说；但凡夫之人贪著其事。”",
        ],
    ),
    (
        "第三十一章 知见不生分",
        [
            "“须菩提！若人言：佛说我见、人见、众生见、寿者见。须菩提！于意云何？是人解我所说义不？”",
            "“不也，世尊！是人不解如来所说义。何以故？世尊说我见、人见、众生见、寿者见，即非我见、人见、众生见、寿者见，是名我见、人见、众生见、寿者见。”",
            "“须菩提！发阿耨多罗三藐三菩提心者，于一切法，应如是知，如是见，如是信解，不生法相。须菩提！所言法相者，如来说即非法相，是名法相。”",
        ],
    ),
    (
        "第三十二章 应化非真分",
        [
            "“须菩提！若有人以满无量阿僧祇世界七宝，持用布施；若有善男子、善女人，发菩提心者，持于此经，乃至四句偈等，受持读诵，为人演说，其福胜彼。云何为人演说，不取于相，如如不动。何以故？”",
            "“一切有为法，如梦幻泡影，如露亦如电，应作如是观。”",
            "佛说是经已，长老须菩提及诸比丘、比丘尼、优婆塞、优婆夷，一切世间天、人、阿修罗，闻佛所说，皆大欢喜，信受奉行。",
        ],
    ),
]


def clean_text(text: str) -> str:
    replacements = {
        "\u00a0": " ",
        "\u3000": " ",
        "\t": " ",
        "「": "“",
        "」": "”",
        "『": "“",
        "』": "”",
        ";": "；",
        "?": "？",
        ":": "：",
        ",": "，",
    }
    for source, target in replacements.items():
        text = text.replace(source, target)
    text = re.sub(r"\s+", " ", text).strip()
    return (
        text.replace(" ，", "，")
        .replace(" 。", "。")
        .replace(" ？", "？")
        .replace(" ：", "：")
    )


def read_docx_paragraphs() -> list[dict[str, object]]:
    with ZipFile(DOCX) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))

    paragraphs: list[dict[str, object]] = []
    for paragraph in root.findall(".//w:body/w:p", NS):
        text_parts: list[str] = []
        for node in paragraph.iter():
            if node.tag == f"{{{NS['w']}}}t":
                text_parts.append(node.text or "")
            elif node.tag == f"{{{NS['w']}}}tab":
                text_parts.append(" ")
            elif node.tag == f"{{{NS['w']}}}br":
                text_parts.append("\n")

        text = clean_text("".join(text_parts))
        if not text:
            continue

        colors: set[str] = set()
        for run in paragraph.findall("./w:r", NS):
            color = run.find("./w:rPr/w:color", NS)
            if color is not None:
                value = color.get(f"{{{NS['w']}}}val")
                if value:
                    colors.add(value.upper())

        paragraphs.append({"text": text, "colors": colors})

    return paragraphs


def is_chapter_title(text: str) -> bool:
    return bool(re.match(r"^第[一二三四五六七八九十百]+章", text)) or text == "尊重正教分"


def normalize_chapter_title(text: str) -> str:
    return "第十二章 尊重正教分" if text == "尊重正教分" else text


def colon_position(text: str) -> int:
    positions = [position for position in (text.find("："), text.find(":")) if position >= 0]
    return min(positions) if positions else -1


def looks_like_glossary(text: str) -> bool:
    position = colon_position(text)
    if position < 0 or position > 28:
        return False
    term = text[:position].strip("“”‘’' ")
    if not term or any(mark in term for mark in "。！？；!?;"):
        return False
    if term in {"如是我闻", "佛言"} or term.startswith(("佛告", "尔时", "复次", "若")):
        return False
    return True


SCRIPTURE_PREFIXES = (
    "“",
    "如是我闻",
    "时，",
    "尔时",
    "佛告",
    "佛言",
    "复次",
    "须菩提",
    "何以故",
    "所以者何",
    "是故",
    "若",
    "于意云何",
    "不也",
    "善哉",
    "唯然",
    "凡所有",
)


MODERN_MARKERS = (
    "佛陀",
    "我们",
    "这个",
    "这里",
    "意思",
    "简单",
    "比如",
    "譬如",
    "现在",
    "大家",
    "为什么",
    "所以",
    "因为",
    "换句话说",
    "一个学佛的人",
    "真正",
)


def looks_like_docx_scripture(text: str, colors: set[str]) -> bool:
    if colors & BLUE_COLORS or looks_like_glossary(text):
        return False
    if any(marker in text for marker in MODERN_MARKERS):
        return False
    return text.startswith(SCRIPTURE_PREFIXES)


def parse_docx_references() -> dict[str, dict[str, list[str]]]:
    chapters: dict[str, dict[str, list[str]]] = {}
    current_title: str | None = None
    preface: list[str] = []

    for paragraph in read_docx_paragraphs():
        text = str(paragraph["text"])
        colors = set(paragraph["colors"])

        if text == "金刚波罗蜜经" or text.startswith("姚秦"):
            continue

        if is_chapter_title(text):
            current_title = normalize_chapter_title(text)
            chapters[current_title] = {"translation": [], "reference": []}
            continue

        if current_title is None:
            preface.append(text)
            continue

        if looks_like_docx_scripture(text, colors):
            continue

        if colors & BLUE_COLORS:
            chapters[current_title]["translation"].append(text)
        else:
            chapters[current_title]["reference"].append(text)

    if STANDARD_CHAPTERS:
        first_title = STANDARD_CHAPTERS[0][0]
        chapters.setdefault(first_title, {"translation": [], "reference": []})
        chapters[first_title]["reference"] = preface + chapters[first_title]["reference"]

    return chapters


def split_original(text: str, max_len: int = 72) -> list[str]:
    text = clean_text(text)
    parts = [part.strip() for part in re.split(r"(?<=[。！？；])", text) if part.strip()]
    final: list[str] = []

    for part in parts:
        if len(part) <= max_len:
            final.append(part)
            continue

        buffer = ""
        for piece in re.split(r"(?<=[，、：])", part):
            piece = piece.strip()
            if not piece:
                continue
            if buffer and len(buffer) + len(piece) > max_len:
                final.append(buffer)
                buffer = piece
            else:
                buffer += piece
        if buffer:
            final.append(buffer)

    merged: list[str] = []
    for part in final:
        bare = re.sub(r"[“”‘’，。！？；：、\s]", "", part)
        if len(bare) <= 4 and merged:
            merged[-1] += part
        else:
            merged.append(part)

    return merged or [text]


def split_units(paragraphs: list[str]) -> list[str]:
    units: list[str] = []
    for paragraph in paragraphs:
        for unit in re.split(r"(?<=[。！？；])", clean_text(paragraph)):
            unit = unit.strip()
            if unit:
                units.append(unit)
    return units


def glossary_from_references(paragraphs: list[str]) -> tuple[list[dict[str, str]], list[str]]:
    glossary: list[dict[str, str]] = []
    commentary: list[str] = []
    current: dict[str, str] | None = None

    for paragraph in paragraphs:
        text = clean_text(paragraph)
        if looks_like_glossary(text):
            position = colon_position(text)
            term = text[:position].strip("“”‘’' ")
            meaning = text[position + 1 :].strip()
            current = {"term": term, "meaning": meaning}
            glossary.append(current)
            continue

        if current and not text.startswith(("我们", "所以", "现在", "这", "因为", "接著", "到了")):
            current["meaning"] += "\n" + text
        else:
            commentary.append(text)
            current = None

    seen: set[str] = set()
    unique: list[dict[str, str]] = []
    for item in glossary:
        term = item["term"]
        compact_term = compact_for_match(term)
        if term in seen or len(term) > 24 or len(compact_term) < 2:
            continue
        seen.add(term)
        unique.append(item)

    return unique, commentary


def bucket_units(units: list[str], index: int, count: int) -> str:
    if not units:
        return ""
    start = round(index * len(units) / count)
    end = round((index + 1) * len(units) / count)
    if end <= start:
        end = min(start + 1, len(units))
    return "\n".join(units[start:end]).strip()


def compact_for_match(text: str) -> str:
    return re.sub(r"[^\u4e00-\u9fffA-Za-z0-9]", "", text)


def matching_glossary(
    sentence: str,
    translation: str,
    commentary: str,
    glossary: list[dict[str, str]],
) -> list[dict[str, str]]:
    haystack = compact_for_match("\n".join([sentence, translation, commentary]))
    matched: list[dict[str, str]] = []

    for item in glossary:
        term = compact_for_match(item["term"])
        if term and term in haystack:
            matched.append(item)

    return matched[:8]


def build_data() -> dict[str, object]:
    docx_references = parse_docx_references()
    chapters: list[dict[str, object]] = []

    for chapter_title, standard_paragraphs in STANDARD_CHAPTERS:
        refs = docx_references.get(chapter_title, {"translation": [], "reference": []})
        glossary, commentary_paragraphs = glossary_from_references(refs["reference"])
        translation_units = split_units(refs["translation"])
        commentary_units = split_units(commentary_paragraphs)

        originals: list[str] = []
        for paragraph in standard_paragraphs:
            originals.extend(split_original(paragraph))

        sentences: list[dict[str, object]] = []
        for index, original in enumerate(originals):
            translation = bucket_units(translation_units, index, len(originals))
            commentary = bucket_units(commentary_units, index, len(originals))
            terms = matching_glossary(original, translation, commentary, glossary)
            explanation_parts = []
            if translation:
                explanation_parts.append(f"白话解释：{translation}")
            if commentary:
                explanation_parts.append(f"参考讲解：{commentary}")
            if not explanation_parts:
                explanation_parts.append(f"本句属于{chapter_title}。可先按经文原意逐句抄写，再结合前后文理解。")

            sentences.append(
                {
                    "original": original,
                    "translation": translation,
                    "commentary": commentary,
                    "explanation": "\n".join(explanation_parts),
                    "glossary": terms,
                }
            )

        chapters.append({"chapterTitle": chapter_title, "sentences": sentences})

    return {
        "title": "金刚经",
        "displayName": "《金刚经》",
        "translator": "姚秦三藏法师鸠摩罗什译",
        "chapters": chapters,
    }


def write_typescript(data: dict[str, object]) -> None:
    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    literal = json.dumps(data, ensure_ascii=False, indent=2)
    OUT_FILE.write_text(
        "\n".join(
            [
                "// This file is generated from 金刚经讲解文.docx plus a corrected public-domain Kumarajiva source text.",
                f"export const diamondSutra = {literal} as const;",
                "",
                "export const diamondSutraSentences = diamondSutra.chapters.flatMap((chapter) =>",
                "  chapter.sentences.map((sentence) => ({",
                "    ...sentence,",
                "    chapterTitle: chapter.chapterTitle,",
                "  })),",
                ");",
                "",
            ]
        ),
        encoding="utf-8",
    )


def main() -> None:
    data = build_data()
    write_typescript(data)
    sentence_count = sum(len(chapter["sentences"]) for chapter in data["chapters"])  # type: ignore[index]
    print(f"Wrote {OUT_FILE.relative_to(ROOT)}")
    print(f"Chapters: {len(data['chapters'])}; sentences: {sentence_count}")


if __name__ == "__main__":
    main()
